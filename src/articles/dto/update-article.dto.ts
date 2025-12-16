import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateArticleDto {
  @IsString({ message: 'Título deve ser uma string' })
  @IsOptional()
  @MaxLength(255, { message: 'Título deve ter no máximo 255 caracteres' })
  title?: string;

  @IsString({ message: 'Conteúdo deve ser uma string' })
  @IsOptional()
  content?: string;
}
