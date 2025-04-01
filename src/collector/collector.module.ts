import { Module } from '@nestjs/common';
import { ProcessLinkController } from './processLink/process-link.controller';
import { ProcessLinkService } from './processLink/process-link.service';
import { ProcessController } from './processSingleFile/processSingleFile.controller';
import { processSingleFileService } from './processSingleFile/processSingleFile.service';
import { ProcessRawTextController } from './processRawText/process-raw.controller';
import { ProcessRawTextService } from './processRawText/process-raw.service';
import { textService } from 'src/server/text.service';
import { chatController } from './chat/chat.ontroller';
import { ChatService } from './chat/chat.service';


@Module({
  imports: [],
  controllers: [ProcessLinkController,ProcessRawTextController,ProcessController,chatController],
  providers: [ProcessLinkService,processSingleFileService,ProcessRawTextService,textService,ChatService],
})
export class CollectorModule {}