import { client } from "@gradio/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = body.prompt;

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is verplicht" }, { status: 400 });
    }

    console.log(`Verbinden met Gradio client voor prompt: "${prompt}"`);

    // Verbind met de publieke HuggingFace space via de directe URL
    const hfSpace = await client("https://nick088-minecraft-skin-generator.hf.space/");

    // De exacte 9 argumenten zoals gespecificeerd door het model en de space
    const result = await hfSpace.predict("/predict", [
      prompt,                                            // 0: Your Prompt (string)
      "xl",                                              // 1: Stable Diffusion Model ('2' of 'xl')
      25,                                                // 2: Number of Inference Steps (number)
      7.5,                                               // 3: Guidance Scale (number)
      "fp16",                                            // 4: Model Precision Type ('fp16' of 'fp32')
      Math.floor(Math.random() * 2147483647),           // 5: Seed (number: 0 tot 2147483647)
      "output-skin.png",                                 // 6: Output Image Name (string)
      true,                                              // 7: See as 3D Model too (boolean)
      false,                                             // 8: Verbose Output (boolean)
    ]);

    const skinData = result.data;
    let imageUrl = null;

    // Gradio geeft de url/pad naar het gegenereerde bestand terug
    // Meestal zit dit in result.data[0].url of result.data[0].path
    if (Array.isArray(skinData) && skinData.length > 0) {
      const first = skinData[0];
      if (typeof first === "string") {
        imageUrl = first;
      } else if (first && typeof first === "object") {
        if ("url" in first && first.url) {
          imageUrl = first.url as string;
        } else if ("path" in first && first.path) {
          imageUrl = first.path as string;
        }
      }
    }

    console.log("Gegeneerde URL:", imageUrl);

    // Als we een URL krijgen, halen we de afbeelding op de server op
    // en converteren we deze naar een Base64 Data-URL om CORS-fouten op de client te voorkomen
    if (imageUrl) {
      try {
        const imageRes = await fetch(imageUrl);
        if (imageRes.ok) {
          const buffer = await imageRes.arrayBuffer();
          const base64 = Buffer.from(buffer).toString("base64");
          imageUrl = `data:image/png;base64,${base64}`;
        } else {
          console.warn("Kon afbeelding niet via server ophalen (status code niet ok). We vallen terug op de originele URL.");
        }
      } catch (proxyError) {
        console.error("Fout bij het ophalen van de afbeelding op de server voor base64 conversie:", proxyError);
        // Val terug op de originele URL als het mislukt
      }
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Geen afbeelding gegenereerd door het model. Probeer het opnieuw." },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      imageUrl: imageUrl,
      data: skinData 
    });

  } catch (error: any) {
    console.error("Generatie fout:", error);
    const errorMessage = error?.message || String(error);
    return NextResponse.json(
      { error: `Fout: ${errorMessage}. Probeer het later opnieuw of handmatig.` }, 
      { status: 500 }
    );
  }
}
