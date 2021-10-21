import { HttpBadRequestError, HttpInternalServerError } from '@errors/http';
import { fileMetadataAsync } from '@helper/gallery/file-metadata';
import { Images, Users } from '@models/MongoDB';
import { dbConnect } from '@services/mongoDbConnect';
import { writeFile } from 'fs';
import { MultipartFile, MultipartRequest } from 'lambda-multipart-parser';
import { LeanDocument } from 'mongoose';
import { Filter, Gallery, Path, User } from './gallery.interface';

export class GalleryService {
  async getImages(page: number, limit: number, filter: string): Promise<Gallery> {
    let pathImages: Array<LeanDocument<Path>>;
    let total: number;
    let images: Array<string | null>;

    try {
      await dbConnect;

      let findFilter: Filter;

      if (filter !== 'all') {
        const id: User = await Users.findOne({ email: filter }).lean();

        if (!id) throw new HttpBadRequestError(`Пользователь ${filter} не найден`);

        findFilter = { imgCreator: id._id };
      } else {
        findFilter = {};
      }

      pathImages = await Images.find(findFilter, {
        _id: false,
        path: 1,
      })
        .lean()
        .skip((page - 1) * limit)
        .limit(limit);

      const totalCount: number = await Images.count(findFilter);
      total = Math.ceil(totalCount / (limit ? limit : totalCount));

      if (pathImages.length === 0) throw new HttpBadRequestError(`Пользователь ${filter} загрузил 0 картинок`);

      if (page > total || page < 1) throw new HttpBadRequestError(`Страница не найдена`);

      images = pathImages.map((img) => img.path);
    } catch (e) {
      if (e instanceof HttpBadRequestError) throw new HttpBadRequestError(e.message);
      throw new HttpInternalServerError(e.message);
    }

    return {
      objects: images,
      page: page,
      total: total,
    };
  }

  async uploadImages(images: MultipartRequest, userUploadId: string): Promise<string> {
    try {
      await dbConnect;
      // @ts-ignore
      await this.saveImages(images, userUploadId);
    } catch (e) {
      throw new HttpInternalServerError(e.message);
    }

    return 'Изображения успешно загружены.';
  }

  async saveImages(files: MultipartRequest, _id: string): Promise<void> {
    const filesArray = files.files;
    try {
      for (const img of filesArray) {
        const findImg: MultipartFile = await Images.findOne({ path: `/images/${img.filename}` });
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
}
