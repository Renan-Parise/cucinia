package ai

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/google/generative-ai-go/genai"
	"github.com/joho/godotenv"
	"google.golang.org/api/option"
)

func SendImageFromFile(filePath string) *genai.GenerateContentResponse {
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env")
	}

	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		log.Fatal("API_KEY not found in .env file")
	}

	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		log.Fatal(err)
	}

	defer client.Close()
	model := client.GenerativeModel("gemini-pro-vision")

	img, err := os.ReadFile(filePath)
	if err != nil {
		log.Fatal(err)
	}

	prompt := []genai.Part{
		genai.Text("Descreva oque está dentro dessa geladeira, onde cada item deve ser seguido de vírgulas, assim: leite,laranja,alface. Escreva apenas oque for ingrediente, sempre no singular e em português. Caso não dê para identificar alimentos, responda apenas: Não existem alimentos."),
		genai.ImageData("jpeg", img),
	}

	res, err := model.GenerateContent(ctx, prompt...)
	if err != nil {
		log.Fatal(err)
	}
	return res
}

func PrintResponse(resp *genai.GenerateContentResponse) {
	for _, cand := range resp.Candidates {
		if cand.Content != nil {
			for _, part := range cand.Content.Parts {
				fmt.Println(part)
			}
		}
	}
}
