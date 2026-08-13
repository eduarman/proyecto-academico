import { Body, ConflictException, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CoursesService } from '../courses/courses.service';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly coursesService: CoursesService,
  ) {}

  // Público: el catálogo sin sesión también necesita "Explora por categoría".
  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  create(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.create(dto.label);
  }

  @Patch(':code')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  update(@Param('code') code: string, @Body() dto: UpdateCategoryDto) {
    return this.categoriesService.update(code, dto.label);
  }

  @Delete(':code')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('ADMIN')
  remove(@Param('code') code: string) {
    const coursesUsingIt = this.coursesService.countByCategory(code);
    if (coursesUsingIt > 0) {
      throw new ConflictException(
        `No se puede eliminar: ${coursesUsingIt} curso(s) usan esta categoría`,
      );
    }
    return this.categoriesService.remove(code);
  }
}
