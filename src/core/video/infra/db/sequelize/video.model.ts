import {
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { CastMemberModel } from '../../../../cast-member/infra/db/sequelize/cast-member.model';
import { RatingValues } from '../../../domain/rating.vo';
import { CategoryModel } from '../../../../category/infra/db/sequelize/category.model';
import { GenreModel } from '../../../../genre/infra/db/sequelize/genre-model';
import { ImageMediaModel } from './image-media.model';
import { AudioVideoMediaModel } from './audio-video-media.model';

export type VideoModelProps = {
  video_id: string;
  title: string;
  description: string;
  year_launched: number;
  duration: number;
  rating: RatingValues;
  is_opened: boolean;
  is_published: boolean;

  image_medias: ImageMediaModel[];
  audio_video_medias: AudioVideoMediaModel[];

  categories_id: VideoCategoryModel[];
  categories?: CategoryModel[];
  genres_id: VideoGenreModel[];
  genres?: CategoryModel[];
  cast_members_id: VideoCastMemberModel[];
  cast_members?: CastMemberModel[];
  created_at: Date;
};

@Table({ tableName: 'videos', timestamps: false })
export class VideoModel extends Model<VideoModelProps> {
  @PrimaryKey
  @Column({ type: DataType.UUID })
  declare video_id: string;

  @Column({ allowNull: false, type: DataType.STRING(255) })
  declare title: string;

  @Column({ allowNull: false, type: DataType.TEXT })
  declare description: string;

  @Column({ allowNull: false, type: DataType.SMALLINT })
  declare year_launched: number;

  @Column({ allowNull: false, type: DataType.SMALLINT })
  declare duration: number;

  @Column({
    allowNull: false,
    type: DataType.ENUM(
      RatingValues.RL,
      RatingValues.R10,
      RatingValues.R12,
      RatingValues.R14,
      RatingValues.R16,
      RatingValues.R18,
    ),
  })
  declare rating: RatingValues;

  @Column({ allowNull: false, type: DataType.BOOLEAN })
  declare is_opened: boolean;

  @Column({ allowNull: false, type: DataType.BOOLEAN })
  declare is_published: boolean;

  //tabela que contem dados de thumbnail, thumbnail-half e banner do video
  @HasMany(() => ImageMediaModel, 'video_id')
  declare image_medias: ImageMediaModel[];

  //tabela que contem dados de trailer e o video
  @HasMany(() => AudioVideoMediaModel, 'video_id')
  declare audio_video_medias: AudioVideoMediaModel[];

  //relacionamento com tabela de categories, trabalhando com a tabela pivo
  //que contem somente os id do video e categoria relacionados, para buscas otimizadas
  @HasMany(() => VideoCategoryModel, 'video_id')
  declare categories_id: VideoCategoryModel[];

  //relacionamento com tabela de categories, trabalhando com a tabela completa de categories
  //retorna todos dados de category, busca mais pesada
  @BelongsToMany(() => CategoryModel, () => VideoCategoryModel)
  declare categories: CategoryModel[];

  //relacionamento com tabela de genres, trabalhando com a tabela pivo
  //que contem somente os id do video e genre relacionados, para buscas otimizadas
  @HasMany(() => VideoGenreModel, 'video_id')
  declare genres_id: VideoGenreModel[];

  //relacionamento com tabela de genres, trabalhando com a tabela completa de categories
  //retorna todos dados de genre, busca mais pesada
  @BelongsToMany(() => GenreModel, () => VideoGenreModel)
  declare genres: GenreModel[];

  //relacionamento com tabela de cast_members, trabalhando com a tabela pivo
  //que contem somente os id do video e categoria relacionados, para buscas otimizadas
  @HasMany(() => VideoCastMemberModel, 'video_id')
  declare cast_members_id: VideoCastMemberModel[];

  //relacionamento com tabela de cast_members, trabalhando com a tabela completa de categories
  //retorna todos dados de category, busca mais pesada
  @BelongsToMany(() => CastMemberModel, () => VideoCastMemberModel)
  declare cast_members: CastMemberModel[];

  @Column({ allowNull: false, type: DataType.DATE(6) })
  declare created_at: Date;
}

export type VideoCategoryModelProps = {
  video_id: string;
  category_id: string;
};

//tabela pivo entre video e category
@Table({ tableName: 'category_video', timestamps: false })
export class VideoCategoryModel extends Model<VideoCategoryModelProps> {
  @PrimaryKey
  @ForeignKey(() => VideoModel)
  @Column({ type: DataType.UUID })
  declare video_id: string;

  @PrimaryKey
  @ForeignKey(() => CategoryModel)
  @Column({ type: DataType.UUID })
  declare category_id: string;
}

export type VideoGenreModelProps = {
  video_id: string;
  genre_id: string;
};

//tabela pivo entre video e genre
@Table({ tableName: 'genre_video', timestamps: false })
export class VideoGenreModel extends Model<VideoGenreModelProps> {
  @PrimaryKey
  @ForeignKey(() => VideoModel)
  @Column({ type: DataType.UUID })
  declare video_id: string;

  @PrimaryKey
  @ForeignKey(() => GenreModel)
  @Column({ type: DataType.UUID })
  declare genre_id: string;
}

export type VideoCastMemberModelProps = {
  video_id: string;
  cast_member_id: string;
};

//tabela pivo entre video e cast member
@Table({ tableName: 'cast_member_video', timestamps: false })
export class VideoCastMemberModel extends Model<VideoCastMemberModelProps> {
  @PrimaryKey
  @ForeignKey(() => VideoModel)
  @Column({ type: DataType.UUID })
  declare video_id: string;

  @PrimaryKey
  @ForeignKey(() => CastMemberModel)
  @Column({ type: DataType.UUID })
  declare cast_member_id: string;
}
