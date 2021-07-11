import { Logger } from 'tslog';

export const log = new Logger({
  displayFilePath: 'hidden',
  displayFunctionName: false,
  displayInstanceName: false,
  colorizePrettyLogs: true,
});
