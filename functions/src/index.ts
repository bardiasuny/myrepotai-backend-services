/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {CallableRequest, onCall} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { getAuth } from "firebase-admin/auth";

const { getFirestore } = require('firebase-admin/firestore');


// The Firebase Admin SDK to access Firestore.
const {initializeApp} = require("firebase-admin/app");
const getPermissions = require("./helpers/getPermissions");

initializeApp();
const  { CreateUser } = require("./helpers/createUser");

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

const db = getFirestore();


type PermissionType = {users?: {role: number, id: string}[], admins?: {role: number, id: string}[], role: number}
function mergeUserData(users:any, permissions:any) {
    return users.map((user: any) => {
      // Find the corresponding permission object using the user's uid
      const permission = permissions.find((p:{id:string}) => p.id === user.uid);
      // If a permission is found, add the role to the user object
      if (permission) {
        return {displayName: user?.displayName, photoURL: user?.photoURL, role: permission?.role, uid: user?.uid};
      }
      // If no permission found, return null
      return null;
    });
  }

  //unmillondemedialunas


export const getUsersAndPermissions = onCall(
  async (request) => {
    try{
        const userRequestedId = request?.auth?.uid;
        logger.log(userRequestedId);
        const permissions:PermissionType = await getPermissions(db, userRequestedId);
        //const userRole = permissions?.role || 3;
        logger.log(permissions);
        //const isAdmin = permissions?.users && permissions?.users?.length > 0 && permissions?.role === 1; 
       // const hasAdmin = permissions?.admins && permissions?.admins?.length > 0 && permissions?.role === 3;
        
        const refs = (permissions?.users || permissions?.admins)?.map(({id}) => db.doc(`users/${id}`))
        if(refs?.length){
            const users = await db.getAll(...refs);
            const userMergedWithRole =  mergeUserData(users.map((doc:any) => doc.data()), permissions?.users || permissions?.admins);
                
            logger.log(userMergedWithRole);
            return {
              role: permissions?.role,
              users: userMergedWithRole
            } 
       } else {
         logger.log('something whnet wrong')
         return null
       }
            
        
    }catch (e) {
        logger.error(e);
        return e;
    }
});


export const setUserOrganisation = onCall(
  async (request: CallableRequest<any>) => {
    try{
      if(!request?.auth?.uid) return {error: 'unauthenticated user'};
      if(!request?.data?.orgId) return {error: 'no orgId provided'};
      //logger.log(request?.auth?.uid, request?.data?.orgId);
      await getAuth().setCustomUserClaims(request?.auth?.uid, { superAdmin: true });
            
      return {message: 'organisation set'};
    }catch (e) {
        logger.error(e);
        return e;
    }
});



// ADMIN FUNCTIONS
export const createUser = onCall(CreateUser);