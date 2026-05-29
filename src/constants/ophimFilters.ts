import type { OPhimListSlug } from '../types/ophim'

export type OPhimFilterOption<TValue extends string = string> = {
    label: string
    value: TValue
}

export const fallbackCategoryOptions: OPhimFilterOption[] = [
    { label: 'Hành động', value: 'hanh-dong' },
    { label: 'Tình cảm', value: 'tinh-cam' },
    { label: 'Hài hước', value: 'hai-huoc' },
    { label: 'Cổ trang', value: 'co-trang' },
    { label: 'Tâm lý', value: 'tam-ly' },
    { label: 'Hình sự', value: 'hinh-su' },
    { label: 'Chiến tranh', value: 'chien-tranh' },
    { label: 'Thể thao', value: 'the-thao' },
    { label: 'Võ thuật', value: 'vo-thuat' },
    { label: 'Viễn tưởng', value: 'vien-tuong' },
    { label: 'Phiêu lưu', value: 'phieu-luu' },
    { label: 'Khoa học', value: 'khoa-hoc' },
    { label: 'Kinh dị', value: 'kinh-di' },
    { label: 'Âm nhạc', value: 'am-nhac' },
    { label: 'Thần thoại', value: 'than-thoai' },
    { label: 'Tài liệu', value: 'tai-lieu' },
    { label: 'Gia đình', value: 'gia-dinh' },
    { label: 'Chính kịch', value: 'chinh-kich' },
    { label: 'Bí ẩn', value: 'bi-an' },
]

export const categoryOptions = fallbackCategoryOptions

export const fallbackCountryOptions: OPhimFilterOption[] = [
    { label: 'Trung Quốc', value: 'trung-quoc' },
    { label: 'Hàn Quốc', value: 'han-quoc' },
    { label: 'Nhật Bản', value: 'nhat-ban' },
    { label: 'Thái Lan', value: 'thai-lan' },
    { label: 'Âu Mỹ', value: 'au-my' },
    { label: 'Đài Loan', value: 'dai-loan' },
    { label: 'Hồng Kông', value: 'hong-kong' },
    { label: 'Ấn Độ', value: 'an-do' },
    { label: 'Anh', value: 'anh' },
    { label: 'Pháp', value: 'phap' },
    { label: 'Đức', value: 'duc' },
    { label: 'Úc', value: 'uc' },
]

export const countryOptions = fallbackCountryOptions

export const listOptions: OPhimFilterOption<OPhimListSlug>[] = [
    { label: 'Phim mới', value: 'phim-moi' },
    { label: 'Phim bộ', value: 'phim-bo' },
    { label: 'Phim lẻ', value: 'phim-le' },
    { label: 'TV Shows', value: 'tv-shows' },
    { label: 'Hoạt hình', value: 'hoat-hinh' },
    { label: 'Vietsub', value: 'phim-vietsub' },
    { label: 'Thuyết minh', value: 'phim-thuyet-minh' },
    { label: 'Lồng tiếng', value: 'phim-long-tien' },
    { label: 'Phim bộ đang chiếu', value: 'phim-bo-dang-chieu' },
    { label: 'Phim bộ hoàn thành', value: 'phim-bo-hoan-thanh' },
    { label: 'Sắp chiếu', value: 'phim-sap-chieu' },
    { label: 'Subteam', value: 'subteam' },
    { label: 'Chiếu rạp', value: 'phim-chieu-rap' },
]
