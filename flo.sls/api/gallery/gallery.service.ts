import { HttpBadRequestError, HttpInternalServerError } from '@errors/http';
import { saveImages } from '@helper/rest-api/saveImages';
import { ImageScheme, UserScheme } from '@models/MongoDB';
import { checkMongoConnect } from '@services/mongoDbConnect';
import { MultipartRequest } from 'lambda-multipart-parser';
import { LeanDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { Gallery, Path, User } from './gallery.interface';

export class GalleryService {
  async getImages(page: number, limit: number, filter: string): Promise<Gallery> {
    let pathImages: Array<LeanDocument<Path>>;
    let total: number;
    let images: Array<string | null>;

    try {
      await checkMongoConnect;
      const Users = mongoose.models.Users || mongoose.model('Users', UserScheme, 'Users');
      const Images = mongoose.model('Images', ImageScheme, 'Images');

      let findFilter;

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

      const totalCount = await Images.count(findFilter);
      total = Math.ceil(totalCount / (limit ? limit : totalCount));

      if (page > total || page < 1) throw new HttpBadRequestError(`Страница не найдена`);

      if (pathImages.length === 0) throw new HttpBadRequestError(`Пользователь ${filter} загрузил 0 картинок`);

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
      await checkMongoConnect;
      // @ts-ignore
      await saveImages(images, userUploadId);
    } catch (e) {
      throw new HttpInternalServerError(e.message);
    }

    return 'Изображения успешно загружены.';
  }
}
