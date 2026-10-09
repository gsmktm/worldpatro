/**
 * Offline administrative role provisioning for World Patro.
 * No publicly callable admin bootstrap endpoint is ever exposed.
 *
 * Usage:
 * FIREBASE_SERVICE_ACCOUNT_JSON_BASE64=... node scripts/grant-firebase-role.mjs <uid> <admin|editor|reviewer|none> --confirm-world-patro
 *
 * Only run on a trusted administrator workstation/runner.
 */
import {cert,initializeApp} from "firebase-admin/app";
import {getAuth} from "firebase-admin/auth";

const [uid,role,confirmation]=process.argv.slice(2);
const roles=new Set(["admin","editor","reviewer","none"]);
if(!uid||uid.length>128||!roles.has(role)||confirmation!=="--confirm-world-patro"){
  process.stderr.write("Usage: node scripts/grant-firebase-role.mjs <uid> <admin|editor|reviewer|none> --confirm-world-patro\n");
  process.exit(2);
}
const raw=process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64;
if(!raw){
  process.stderr.write("FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 is required. Configure a trusted environment; never commit it.\n");
  process.exit(2);
}
let account;
try{account=JSON.parse(Buffer.from(raw,"base64").toString("utf8"));}
catch{process.stderr.write("Invalid Firebase Admin service-account encoding.\n");process.exit(2);}
if(account.project_id!=="world-patro"||!account.client_email||!account.private_key){
  process.stderr.write("Credential is not for the expected world-patro Firebase project.\n");
  process.exit(2);
}
const app=initializeApp({credential:cert({
  projectId:account.project_id,clientEmail:account.client_email,privateKey:account.private_key
})});
const auth=getAuth(app);
try{
  const user=await auth.getUser(uid);
  if(user.disabled)throw new Error("Cannot grant a role to a disabled account.");
  // Preserve unrelated claims; do not silently overwrite them.
  const claims={...(user.customClaims||{})};
  if(role==="none")delete claims.worldpatro_role;
  else claims.worldpatro_role=role;
  await auth.setCustomUserClaims(uid,claims);
  // Existing sessions may carry old claims; revocation requires a fresh sign-in/token.
  await auth.revokeRefreshTokens(uid);
  process.stdout.write("World Patro role updated for UID "+uid+"; role="+role+"; sessions revoked. Re-authentication required.\n");
}catch(error){
  process.stderr.write("Role change failed: "+(error instanceof Error?error.message:"unknown error")+"\n");
  process.exitCode=1;
}
