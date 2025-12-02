const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: "sk-YiDpoQ3pUGPAwLHjNkN70F6c1OuU4yb2eUkvzhssVSaCueaa",
  baseURL: "https://apigateway.avangenio.net",
});

async function getCompletion() {
  try {
    const completion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "Dime de que froma puedo entrenarte o enseñarte infromación especifica de mi negocio para que me puedas dar una respuesta concreta hacerca de mi negocio?" }
      ],
      model: "radiance",
    });

    console.log(completion.choices[0].message.content);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Ejecutar la función
getCompletion();