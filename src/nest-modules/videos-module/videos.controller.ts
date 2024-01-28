import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Inject,
  ParseUUIDPipe,
  ValidationPipe,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { CreateVideoUseCase } from '@core/video/application/use-cases/create-video/create-video.use-case';
import { UpdateVideoUseCase } from '@core/video/application/use-cases/update-video/update-video.use-case';
import { UploadAudioVideoMediasUseCase } from '@core/video/application/use-cases/upload-audio-video-medias/upload-audio-video-medias.use-case';
import { GetVideoUseCase } from '@core/video/application/use-cases/get-video/get-video.use-case';
import { UpdateVideoInput } from '@core/video/application/use-cases/update-video/update-video.input';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UploadAudioVideoMediaInput } from '@core/video/application/use-cases/upload-audio-video-medias/upload-audio-video-medias.input';

@Controller('videos')
export class VideosController {
  @Inject(CreateVideoUseCase)
  private createUseCase: CreateVideoUseCase;

  @Inject(UpdateVideoUseCase)
  private updateUseCase: UpdateVideoUseCase;

  @Inject(UploadAudioVideoMediasUseCase)
  private uploadAudioVideoMediasUseCase: UploadAudioVideoMediasUseCase;

  @Inject(GetVideoUseCase)
  private getUseCase: GetVideoUseCase;

  /*
  @Inject(ProccessAudioVideoMediasUseCase)
  private listUseCase: ProccessAudioVideoMediasUseCase;
  */

  @Post()
  async create(@Body() createVideoDto: CreateVideoDto) {
    const { id } = await this.createUseCase.execute(createVideoDto);
    //criar presenter
    return this.getUseCase.execute({ id });
  }

  /*
  @Get()
  findAll() {
    return this.videosService.findAll();
  }
  */

  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
  ) {
    return this.getUseCase.execute({ id });
    //criar presenter
  }

  //serve para upadte dos dados comun do arquivo de video quanto para os arquivos
  //se o update for dos dados comun o Body ira conter os dados
  //se tentar enviar dados comun do video e arquivos ira retornar um erro
  @UseInterceptors(
    //arquivos que serao interceptados
    FileFieldsInterceptor([
      //nome do campo que o arquivo sera recebido, e a quantidade
      { name: 'banner', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
      { name: 'thumbnail_half', maxCount: 1 },
      { name: 'trailer', maxCount: 1 },
      { name: 'video', maxCount: 1 },
    ]),
  )
  @Patch(':id')
  async upadte(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
    @Body() upadteVideoDto: any, //pode receber dados ou nao
    //variavel que ira conter os arquivos
    @UploadedFiles()
    files: {
      banner?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
      thumbnail_half?: Express.Multer.File[];
      trailer?: Express.Multer.File[];
      video?: Express.Multer.File[];
    },
  ) {
    //verificar se existe files na requisicao, se nao tiver nada em files, ele sera um objeto vazio
    const hasFiles = files ? Object.keys(files).length > 0 : false;
    //verificar se ha dados no body, se o tamanho das chaves do upadteVideoDto for maior que 0 contem dados no body
    const hasData = Object.keys(upadteVideoDto).length > 0;

    if (hasFiles && hasData) {
      throw new BadRequestException('Files and Data cannot be sent together');
    }

    if (hasData) {
      //validar dados do body, validacao manual dos dados do body com ValidationPipe
      const data = await new ValidationPipe({
        errorHttpStatusCode: 422,
      }).transform(upadteVideoDto, {
        metatype: UpdateVideoDto,
        type: 'body',
      });

      const input = new UpdateVideoInput({ id, ...data });

      await this.updateUseCase.execute(input);
      //criar presenter de saida
      return this.getUseCase.execute({ id });
    }

    //verificar se esta sendo passado mais de um arquivo
    const hasMoreThanOneFile = Object.keys(files).length > 1;

    //permitir enviar 1 arquivo por vez para evitar problemas de performance
    if (hasMoreThanOneFile) {
      throw new BadRequestException('Only one file can be sent');
    }

    //verificar se o arquivo é de video trailer ou video
    const hasAudioVideoMedia = files.trailer?.length || files.video?.length;
    //pegar o tipo do arquivo, posicao 0 das chaves de files contem o tipo do arquivo (banner,thubnail,trailer ou video)
    const field = Object.keys(files)[0];
    //pegar o arquivo, pelo tipo, que é a chave do objeto
    const file = files[field][0];
    if (hasAudioVideoMedia) {
      const inputDto: UploadAudioVideoMediaInput = {
        video_id: id,
        field: field as any,
        file: {
          raw_name: file.originalname,
          data: file.buffer,
          mime_type: file.mimetype,
          size: file.size,
        },
      };
      //validar dados do body com file, validacao manual dos dados do body com ValidationPipe
      const input = await new ValidationPipe({
        errorHttpStatusCode: 422,
      }).transform(inputDto, {
        metatype: UploadAudioVideoMediaInput,
        type: 'body',
      });

      await this.uploadAudioVideoMediasUseCase.execute(input);
    } else {
      //TODO
    }

    //criar presenter de saida
    return this.getUseCase.execute({ id });
  }
}
