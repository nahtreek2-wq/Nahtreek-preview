import { Controller, Get, Param, Query } from '@nestjs/common';
import { DiscoveryService } from './discovery.service';

@Controller('discovery')
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Get('engineers')
  async getEngineers(
    @Query('specialization') specialization?: string,
    @Query('sort') sort?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('city') city?: string,
    @Query('state') state?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
  ) {
    return this.discoveryService.getEngineers({ specialization, sort, page, limit, city, state, lat, lng });
  }

  @Get('engineers/:id')
  async getEngineer(@Param('id') id: string) {
    return this.discoveryService.getEngineer(id);
  }

  @Get('providers/by-code/:code')
  async getProviderByCode(@Param('code') code: string) {
    return this.discoveryService.getProviderByCode(code);
  }

  @Get('providers/:id')
  async getProvider(@Param('id') id: string) {
    return this.discoveryService.getProvider(id);
  }

  @Get('search')
  async search(@Query('q') q?: string, @Query('city') city?: string, @Query('state') state?: string, @Query('lat') lat?: string, @Query('lng') lng?: string) {
    return this.discoveryService.search(q ?? '', city, state, lat, lng);
  }

  @Get('specializations')
  async specializations() {
    return this.discoveryService.specializations();
  }
}
