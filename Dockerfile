FROM node:16.0.0-buster-slim as builder

RUN apt-get update \
    && apt-get install python make g++ -y \
    && apt-get clean

WORKDIR /app
COPY . /app
RUN npm install

RUN npm run build && npm prune --production

# ---

FROM node:16.0.0-alpine

WORKDIR /app

ADD package.json .
ADD nuxt.config.js .
COPY server-middleware /app/server-middleware

# RUN true magically help. Without it, the three COPY fails.
COPY --from=builder /app/node_modules /app/node_modules/
RUN true
COPY --from=builder /app/nuxt.config.js /app
RUN true
COPY --from=builder /app/.nuxt /app/.nuxt

# Placeholder for ENV
ENV HF_API_SECRET=
ENV TEXT_TO_PHONEME_URL=
ENV AUDIO_TO_PHONEME_URL=
ENV BROWSER_BASE_URL=
# Speech ENV
ENV SPEECH_API_KEY=
ENV SPEECH_API_REGION=
# Azure COSMOS
ENV AZURE_COSMOS_ENDPOINT=
ENV AZURE_COSMOS_KEY=

EXPOSE 3000

CMD ["yarn", "start"]