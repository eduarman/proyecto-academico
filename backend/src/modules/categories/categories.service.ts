import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';

export interface Category {
  code: string;
  label: string;
}

const DIACRITICS_PATTERN = '\\u0300-\\u036f';
const STRIP_DIACRITICS = new RegExp('[' + DIACRITICS_PATTERN + ']', 'g');

@Injectable()
export class CategoriesService {
  private readonly categories: Category[] = [
    { code: 'OFFICE', label: 'Office' },
    { code: 'SQL', label: 'SQL' },
    { code: 'ANALISIS_DATOS', label: 'Análisis de Datos' },
    { code: 'MARKETING', label: 'Marketing' },
  ];

  findAll() {
    return this.categories;
  }

  exists(code: string) {
    return this.categories.some((entry) => entry.code === code);
  }

  create(label: string) {
    const trimmed = label.trim();
    const code = this.toCode(trimmed);

    if (this.categories.some((entry) => entry.code === code)) {
      throw new ConflictException('Ya existe una categoría con ese nombre');
    }

    const category: Category = { code, label: trimmed };
    this.categories.push(category);
    return category;
  }

  update(code: string, label: string) {
    const category = this.categories.find((entry) => entry.code === code);
    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }
    // El código no cambia al renombrar: los cursos existentes referencian la categoría por code.
    category.label = label.trim();
    return category;
  }

  remove(code: string) {
    const index = this.categories.findIndex((entry) => entry.code === code);
    if (index === -1) {
      throw new NotFoundException('Categoría no encontrada');
    }
    const [removed] = this.categories.splice(index, 1);
    return removed;
  }

  private toCode(label: string) {
    return label
      .normalize('NFD')
      .replace(STRIP_DIACRITICS, '')
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }
}
