import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { URL } from 'url';

admin.initializeApp();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

export const updateUploadedAt = functions.storage.object().onFinalize((object) => {
  const path = object.name;
  const pathSegments = path.split('/');
  const fileRequestId = pathSegments[pathSegments.indexOf('fileRequests') + 1];
  const sharedFileId = pathSegments[pathSegments.indexOf('files') + 1].split('.')[0];
  return admin.firestore().doc(`fileRequests/${ fileRequestId }/files/${ sharedFileId }`).update({
    uploadedAt: new Date(),
  });
});
