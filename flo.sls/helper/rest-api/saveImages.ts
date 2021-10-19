import { ImageScheme } from '@models/MongoDB';
import { writeFile } from 'fs';
import { MultipartRequest } from 'lambda-multipart-parser';
import { fileMetadataAsync } from '@helper/rest-api/file-metadata';
import * as mongoose from 'mongoose';

async function saveImages(files: MultipartRequest, _id: string): Promise<void> {
  const Images = mongoose.model('Images', ImageScheme, 'Images');
  const filesArray = files.files;
  try {
    for (const img of filesArray) {
      const findImg = await Images.findOne({ path: `/images/${img.filename}` });
      if (findImg) continue;

      await writeFile(`images/${img.filename}`, img.content, (err) => {
        if (err) {
          console.log(err);
        }
      });

      await Images.create({
        path: `/images/${img.filename}`,
        metadata: await fileMetadataAsync(`images/${img.filename}`),
        imgCreator: _id,
      });
    }
  } catch (err) {
    return err;
  }
}

export { saveImages };
