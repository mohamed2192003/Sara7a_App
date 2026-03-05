import { bootstrap } from "./app.controller.js";
bootstrap()

// $ openssl genrsa -out private.key 2048    => to generate the private key (decrypting) (don't post on github)

// $ openssl rsa -in private.key -pubout -out public.key       => to manage teleporting between github repos