import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  process.on("unhandledRejection",(e)=>{
    console.log("--------- im here --------")
    console.log(e)
  })
  await app.listen(4000);
}
bootstrap();
