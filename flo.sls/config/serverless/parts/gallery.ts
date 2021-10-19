import { AWSPartitial } from '../types';

export const galleryConfig: AWSPartitial = {
  provider: {
    httpApi: {
      authorizers: {
        exampleAuthorizer: {
          type: 'request',
          enableSimpleResponses: true,
          functionName: 'exampleAuthorizerHttpApi',
          identitySource: '$request.header.Authorization',
        },
      },
    },
  },
  functions: {
    getGallery: {
      handler: 'api/gallery/handler.getGallery',
      memorySize: 128,
      events: [
        {
          http: {
            path: '/gallery',
            method: 'get',
            integration: 'lambda',
            cors: true,
            response: {
              headers: {
                'Access-Control-Allow-Origin': "'*'",
                'Content-Type': "'application/json'",
              },
              template: "$input.json('$')",
            },
            authorizer: {
              name: 'exampleAuthorizerRestApi',
            },
          },
        },
      ],
    },
    addImageGallery: {
      handler: 'api/gallery/handler.addImageGallery',
      memorySize: 500,
      events: [
        {
          http: {
            path: '/gallery/upload',
            method: 'post',
            integration: 'lambda-proxy',
            cors: true,
            response: {
              headers: {
                'Access-Control-Allow-Origin': "'*'",
                'Content-Type': "'application/json'",
              },
              template: "$input.json('$')",
            },
            authorizer: {
              name: 'exampleAuthorizerRestApi',
            },
          },
        },
      ],
    },
    exampleAuthorizerRestApi: {
      handler: 'api/auth/handler.authentication',
      memorySize: 128,
    },
  },
};
