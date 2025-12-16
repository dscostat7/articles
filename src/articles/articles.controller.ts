import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto, UpdateArticleDto } from './dto';
import { JwtAuthGuard, PermissionsGuard } from '../common/guards';
import { Permissions, CurrentUser } from '../common/decorators';
import { PermissionName } from '../permissions/entities/permission.entity';

@Controller('articles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @Permissions(PermissionName.ADMIN, PermissionName.EDITOR)
  async create(
    @Body() createArticleDto: CreateArticleDto,
    @CurrentUser() user: any,
  ) {
    return this.articlesService.create(createArticleDto, user.id);
  }

  @Get()
  @Permissions(PermissionName.ADMIN, PermissionName.EDITOR, PermissionName.READER)
  async findAll() {
    const articles = await this.articlesService.findAll();
    
    // Remove sensitive information from author
    return articles.map((article) => ({
      ...article,
      author: {
        id: article.author.id,
        name: article.author.name,
        email: article.author.email,
        permission: article.author.permission?.name,
      },
    }));
  }

  @Get(':id')
  @Permissions(PermissionName.ADMIN, PermissionName.EDITOR, PermissionName.READER)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const article = await this.articlesService.findOne(id);
    
    return {
      ...article,
      author: {
        id: article.author.id,
        name: article.author.name,
        email: article.author.email,
        permission: article.author.permission?.name,
      },
    };
  }

  @Patch(':id')
  @Permissions(PermissionName.ADMIN, PermissionName.EDITOR)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    const article = await this.articlesService.update(id, updateArticleDto);
    
    return {
      ...article,
      author: {
        id: article.author.id,
        name: article.author.name,
        email: article.author.email,
        permission: article.author.permission?.name,
      },
    };
  }

  @Delete(':id')
  @Permissions(PermissionName.ADMIN, PermissionName.EDITOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.articlesService.remove(id);
  }
}
