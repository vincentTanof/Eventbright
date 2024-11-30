declare module "nodemailer-express-handlebars" {
    import { Options as NodemailerOptions } from "nodemailer/lib/mailer";
  
    interface ViewEngineOptions {
      extname?: string;
      layoutsDir?: string;
      partialsDir?: string;
      defaultLayout?: string | false;
    }
  
    interface NodemailerExpressHandlebarsOptions {
      viewEngine: ViewEngineOptions;
      viewPath: string;
      extName?: string;
    }
  
    export default function (
      options?: NodemailerExpressHandlebarsOptions
    ): (mail: NodemailerOptions) => void;
  }
  