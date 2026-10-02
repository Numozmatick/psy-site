import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
const dest=path.resolve('dist/beget');
// Build in a fresh directory in CI; reruns preserve no private live-server data here.
await fs.mkdir(dest,{recursive:true});
await fs.cp('out',dest+'/public_html',{recursive:true});
await fs.cp('server/public_html',dest+'/public_html',{recursive:true});
await fs.cp('server/private',dest+'/private',{recursive:true,filter:source=>!source.endsWith('mail-config.php')});
const example=dest+'/private/mail-config.example.php';
let config=await fs.readFile(example,'utf8');
if(!config.includes("'smtp_password' => ''") || !config.includes("'enabled' => false"))throw Error('The template must not contain credentials or enable SMTP.');
config=config.replace(/'rate_secret' => '[^']*'/,"'rate_secret' => '"+crypto.randomBytes(32).toString('hex')+"'");
await fs.writeFile(example,config);
// Include a ready-to-edit config for manual uploads; never copy local credentials.
await fs.writeFile(dest+'/private/mail-config.php',config.replace("'enabled' => false", "'enabled' => true"), {mode:0o600});
const revision=process.env.GITHUB_SHA || 'local';
await fs.writeFile(dest+'/public_html/deploy-version.txt',revision+'\n');
console.log('Deployment artifact ready: dist/beget (no SMTP password).');
