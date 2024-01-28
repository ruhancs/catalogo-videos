import { ICastMemberRepository } from '../../../../cast-member/domain/cast-member.repository';
import { ICategoryRepository } from '../../../../category/domain/category_repository';
import { IGenreRepository } from '../../../../genre/domain/genre-repository';
import { IUseCase } from '../../../../shared/application/use-case.interface';
import { NotFoundError } from '../../../../shared/domain/errors/not_found';
import { Video, VideoId } from '../../../domain/video.aggregate';
import { IVideoRepository } from '../../../domain/video.repository';
import { VideoOutput, VideoOutputMapper } from '../../common/video-output';

export class GetVideoUseCase
  implements IUseCase<GetVideoInput, GetVideoOutput>
{
  //pode se usar modelo de busca DAO - data access object
  constructor(
    private videoRepo: IVideoRepository,
    private categoryRepo: ICategoryRepository,
    private genreRepo: IGenreRepository,
    private castMemberRepo: ICastMemberRepository,
  ) {}

  async execute(input: GetVideoInput): Promise<GetVideoOutput> {
    //criar videoId
    const videoId = new VideoId(input.id);
    //buscar video no db
    const video = await this.videoRepo.findById(videoId);
    if (!video) {
      //se video nao existir retorna um erro
      throw new NotFoundError(input.id, Video);
    }
    //buscar genres do video encontrado no db, transformando Map<string, GenreId> em array de GenreId
    const genres = await this.genreRepo.findByIds(
      Array.from(video.genres_id.values()),
    );

    //buscar categorias do video, criando um array entre os Map que existem em video e genre dos ids de categoria
    //pega todas categorias de video e genre
    const categories = await this.categoryRepo.findByIds(
      Array.from(video.categories_id.values()).concat(
        genres.flatMap((g) => Array.from(g.categories_id.values())),
      ),
    );

    const castMembers = await this.castMemberRepo.findByIds(
      Array.from(video.cast_members_id.values()),
    );

    return VideoOutputMapper.toOutput({
      video,
      genres,
      cast_members: castMembers,
      allCategoriesOfVideoAndGenre: categories,
    });
  }
}

export type GetVideoInput = {
  id: string;
};

export type GetVideoOutput = VideoOutput;
