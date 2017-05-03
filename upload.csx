#r "Microsoft.WindowsAzure.Storage"
#r "Newtonsoft.Json"

using System.Net;
using Microsoft.WindowsAzure.Storage.Blob;
using Microsoft.Azure.Devices;
using Microsoft.Azure.WebJobs;
using Newtonsoft.Json;

public static async Task<HttpResponseMessage> Run(HttpRequestMessage req, string deviceId, TraceWriter log, Binder binder) 
{
 
    HttpResponseMessage result = null; 
     
    if (req.Content.IsMimeMultipartContent())
    {
            // memory stream of the incomping request 
            var streamProvider = new MultipartMemoryStreamProvider ();
 
            await req.Content.ReadAsMultipartAsync(streamProvider);
            
            //using a stream saves the 'last' image if multiple are uploaded
            foreach (HttpContent ctnt in streamProvider.Contents)
            {
                // You would get hold of the inner memory stream here
                Stream stream = ctnt.ReadAsStreamAsync().Result;                
                // save the stream to output blob, which will save it to Azure stroage blob
                //stream.CopyTo(outputBlob);
                
                var blobName = Guid.NewGuid();
                var containerName = $"uploaded-images/{blobName}";

                using (var writer = await binder.BindAsync<Stream>(new BlobAttribute(containerName, FileAccess.Write)))
                {
                    stream.CopyTo(writer);
                }

                // A null service...for later...be patient!
                ServiceClient serviceClient;
                
                // // Get the service's connection string
                var connectionString =  System.Environment.GetEnvironmentVariable("IOTHUB_SERVICE_CONNECTION", EnvironmentVariableTarget.Process);
                
                // Setup the service client so we can send messages to a device
                serviceClient = ServiceClient.CreateFromConnectionString(connectionString);

                var message = new MessageObj {
                    imageUrl = $"https://caiothubsolution.blob.core.windows.net/{containerName}"
                };

                var commandMessage = new Message(System.Text.Encoding.ASCII.GetBytes(JsonConvert.SerializeObject(message)));
                
                serviceClient.SendAsync(deviceId, commandMessage);

                result = req.CreateResponse(HttpStatusCode.OK, message, "application/json");
            }            
        }
        else
        {
            result = req.CreateResponse(HttpStatusCode.NotAcceptable);
        }
    return result;
}

public class MessageObj {
    public string imageUrl {get; set;}
}