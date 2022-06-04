# Build Docker
docker build -t prepper-server . 

# Run
docker run --rm -it --env-file .env -p 3000:3000 prepper-server

# Tag the name
docker tag prepper-server responsibleairegistry.azurecr.io/nuxt-frontend-server

# Login to the registry before the push
az acr login --name responsibleairegistry

# Push to Azure ACR (Registry)
docker push responsibleairegistry.azurecr.io/nuxt-frontend-server