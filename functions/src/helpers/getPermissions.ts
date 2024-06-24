
const { Firestore } = require("firebase-admin/firestore");

const getPermissions: (db: typeof Firestore, userId: string) => Promise<{users: {role: number, id: string}[], role: number}> = async (db: typeof Firestore, userId: string) => {
    if(!userId) {
        throw new Error('User ID is required');
    }
    const writeResult = await db.collection('permissions').doc(userId).get();

    return writeResult?.data();
}

module.exports = getPermissions;