import { supabase } from '@/lib/supabase';
import { uploadImageToGitHub, getJsDelivrUrl, deleteFileFromGitHub } from '@/lib/github';
import { Media } from '@/types/database';
import { FILE_UPLOAD_LIMITS, STORAGE_PATHS, MEDIA_TYPES } from '@/lib/constants';

/**
 * 上传文件
 * 处理文件验证、生成存储路径、上传至 GitHub 并保存记录到数据库
 * @param {File} file - 文件对象
 * @param {typeof MEDIA_TYPES[keyof typeof MEDIA_TYPES]} type - 媒体类型（从 MEDIA_TYPES 常量中获取）
 * @param {string} [contextId] - 上下文 ID（如文章 ID，用于生成路径）
 * @param {string} [userId] - 用户 ID（用于生成头像路径）
 * @returns {Promise<Media>} - 返回上传成功的媒体信息
 */
export async function uploadMedia(
  file: File,
  type: typeof MEDIA_TYPES[keyof typeof MEDIA_TYPES],
  contextId?: string,
  userId?: string
): Promise<Media> {
  if (!FILE_UPLOAD_LIMITS.ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
    throw new Error(`不支持的文件类型: ${file.type}`);
  }

  if (file.size > FILE_UPLOAD_LIMITS.MAX_SIZE) {
    throw new Error(`文件大小超过限制，最大 ${FILE_UPLOAD_LIMITS.MAX_SIZE_MB}MB`);
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const content = buffer.toString('base64');

  const ext = file.name.split('.').pop() || 'jpg';
  const uuid = crypto.randomUUID();
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');

  let filePath = '';
  
  switch (type) {
    case MEDIA_TYPES.AVATAR:
      filePath = `${STORAGE_PATHS.AVATAR}/${userId || 'user'}.${ext}`;
      break;
    case MEDIA_TYPES.POST:
      const articlePart = contextId || 'draft';
      filePath = `${STORAGE_PATHS.POSTS}/${articlePart}-${dateStr}/${uuid}.${ext}`;
      break;
    case MEDIA_TYPES.SITE:
      filePath = `${STORAGE_PATHS.SITE}/${uuid}.${ext}`;
      break;
    default:
      filePath = `${STORAGE_PATHS.OTHERS}/${dateStr}/${uuid}.${ext}`;
      break;
  }

  await uploadImageToGitHub(content, filePath, `Upload ${type} image: ${filePath}`);
  const url = getJsDelivrUrl(filePath);

  const mediaType = type === MEDIA_TYPES.POST ? MEDIA_TYPES.BLOG : type;

  const { data, error } = await supabase
    .from('media')
    .insert({
      filename: file.name,
      url,
      path: filePath,
      size: file.size,
      type: mediaType,
    })
    .select()
    .single();

  if (error) {
    if (error.message.includes('media_type_check')) {
      const fallbackType = type === MEDIA_TYPES.POST ? MEDIA_TYPES.BLOG : MEDIA_TYPES.OTHER;
      const { data: retryData, error: retryError } = await supabase
        .from('media')
        .insert({
          filename: file.name,
          url,
          path: filePath,
          size: file.size,
          type: fallbackType,
        })
        .select()
        .single();

      if (retryError) {
        throw new Error(`保存媒体记录失败: ${retryError.message}`);
      }
      return retryData as Media;
    }
    throw new Error(`保存媒体记录失败: ${error.message}`);
  }

  return data as Media;
}

/**
 * 根据 ID 获取媒体
 * @param {string} id - 媒体 ID
 * @returns {Promise<Media | null>} - 返回媒体信息，未找到则返回 null
 */
export async function getMediaById(id: string): Promise<Media | null> {
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`获取媒体失败: ${error.message}`);
    return null;
  }

  return data as Media | null;
}

/**
 * 获取媒体列表
 * 支持按类型筛选及分页
 * @param {typeof MEDIA_TYPES[keyof typeof MEDIA_TYPES]} [type] - 媒体类型
 * @param {number} [page=1] - 页码
 * @param {number} [limit=20] - 每页数量
 * @returns {Promise<{ data: Media[], total: number, page: number, limit: number, totalPages: number }>} - 返回媒体列表及分页信息
 */
export async function getMediaList(
  type?: typeof MEDIA_TYPES[keyof typeof MEDIA_TYPES],
  page = 1,
  limit = 20
) {
  let query = supabase
    .from('media')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (type) {
    query = query.eq('type', type);
  }

  const from = (page - 1) * limit;
  const to = page * limit - 1;

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new Error(`获取媒体列表失败: ${error.message}`);
  }

  return {
    data: (data || []) as Media[],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

/**
 * 删除媒体
 * 同时从 GitHub 存储和数据库记录中删除
 * @param {string} id - 媒体 ID
 * @returns {Promise<{ success: boolean }>} - 返回删除结果
 */
export async function deleteMedia(id: string): Promise<{ success: boolean }> {
  const media = await getMediaById(id);
  
  if (!media) {
    throw new Error('媒体文件不存在');
  }

  try {
    await deleteFileFromGitHub(media.path, 'Delete media via Blog Admin');
  } catch (error) {
    console.error('从 GitHub 删除文件失败:', error);
  }

  const { error } = await supabase
    .from('media')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`删除媒体记录失败: ${error.message}`);
  }

  return { success: true };
}

/**
 * 批量删除媒体
 * @param {string[]} ids - 媒体 ID 数组
 * @returns {Promise<{ success: boolean, count: number }>} - 返回是否全部成功以及成功删除的数量
 */
export async function deleteMultipleMedia(ids: string[]): Promise<{ success: boolean; count: number }> {
  const results = await Promise.allSettled(
    ids.map(id => deleteMedia(id))
  );

  const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;

  return {
    success: successCount === ids.length,
    count: successCount,
  };
}
