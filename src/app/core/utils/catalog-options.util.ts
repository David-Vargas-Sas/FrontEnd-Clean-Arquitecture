import { ApiResponse, ListQuery, Row } from '@/models/api/api.model';
import { Option } from '@/shared/models/form.model';
import { MAX_PAGE_SIZE } from '@/core/constants/api.constants';

export async function loadCatalogOptions<T extends Row>(list: (query: ListQuery) => Promise<ApiResponse<T[]>>, map: (row: T) => Option): Promise<Option[]> {
  const options: Option[] = [];
  for (let offset = 0; ; offset += MAX_PAGE_SIZE) {
    const { data } = await list({ offset, limit: MAX_PAGE_SIZE });
    options.push(...data.map(map));
    if (data.length < MAX_PAGE_SIZE) return options;
  }
}
