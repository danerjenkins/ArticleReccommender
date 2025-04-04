import axios from "axios";

export default async function AzureCall(contentId: number): Promise<any> {

  // Define the request data
  const data = {
    Inputs: {
      WebServiceInput1: [
        {
          personId: -8.845298781299428e18,
          contentId: contentId,
        },
      ],
    },
  };

  // Define the endpoint URL and API key
  const url =
    "http://f9b702fe-a007-4ba6-b3ef-b2ab9274d826.eastus2.azurecontainer.io/score";
  const apiKey = "ESEUkbzm1AdubvwSUZEPRaKdsUu60Vhu";

  if (!apiKey) {
    throw new Error("A key should be provided to invoke the endpoint");
  }

  // Define the headers
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  // Make the POST request
  axios
    .post(url, data, { headers })
    .then((response: any) => {
      return response.json(); // Return the response to be used in the calling function
    })
    .catch((error: { response: { status: any; headers: any; data: any; }; message: any; }) => {
      if (error.response) {
        console.error(
          "The request failed with status code:",
          error.response.status
        );
        console.error("Headers:", error.response.headers);
        console.error("Error data:", error.response.data);
      } else {
        console.error("Error:", error.message);
      }
      return new Response(
         JSON.stringify({
            error: "An error occurred while calling the Azure ML endpoint.",
            details: error.message,
            }))
    });
}
