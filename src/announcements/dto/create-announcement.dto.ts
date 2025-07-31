export class CreateAnnouncementDto {
  title: string;
  agency?: string;
  details?: string;
  application_start_date?: Date;
  application_end_date?: Date;
  official_link?: string;
}
