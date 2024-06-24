
const { getAuth } = require("firebase-admin/auth");
const { FieldValue, getFirestore } = require("firebase-admin/firestore");
const logger = require("firebase-functions/logger");
const { CallableRequest } = require("firebase-functions/v2/https");


const db = getFirestore()

export const CreateUser = async (request: typeof CallableRequest) => {
    try{
      if(!request?.auth?.uid && request?.auth?.token?.superAdmin) return {error: 'onLy super admin can add user'};
      const {email, password, displayName, photoURL, phoneNumber} = request?.data;
     const newUser = await getAuth().createUser({
        email,
        emailVerified: false,
        phoneNumber,
        password,
        displayName,
        photoURL,
        disabled: false,
      })
      const userRef = db.collection('users').doc(newUser?.uid);
      await userRef.set({
        displayName,
        email,
        photoURL: photoURL || null,
        phoneNumber: phoneNumber || null,
        createdAt: FieldValue.serverTimestamp(),
        createdBy: request?.auth?.uid
      })
      return newUser;
    }catch (e) {
        logger.error(e);
        return e;
    }
}