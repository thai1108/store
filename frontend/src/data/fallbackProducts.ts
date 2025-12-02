import { Product } from "@/types/product";

export const fallbackProducts: Product[] = [
  {
    id: "milk-tea-01",
    name: "Trà Sữa Trân Châu Đường Đen",
    description:
      "Hương vị caramel nâu đậm đà, kết hợp trân châu dẻo và lớp kem sữa mịn màng.",
    price: 49000,
    category: "milk-tea",
    imageUrl:
      "https://images.unsplash.com/photo-1581382575286-441b418a0097?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    images: [
      {
        imageUrl:
          "https://images.unsplash.com/photo-1581382575286-441b418a0097?auto=format&fit=crop&w=800&q=80",
        displayOrder: 1,
      },
    ],
  },
  {
    id: "fruit-tea-02",
    name: "Trà Đào Cam Sả",
    description:
      "Vị trà đào tươi mát hòa quyện cùng cam vàng và hương sả nhẹ nhàng, giải nhiệt tức thì.",
    price: 45000,
    category: "drink",
    imageUrl:
      "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "matcha-03",
    name: "Matcha Latte Kem Sữa",
    description:
      "Matcha Nhật Bản thơm dịu, kết hợp sữa tươi béo nhẹ và lớp kem cheese mặn mà.",
    price: 52000,
    category: "milk-tea",
    imageUrl:
      "https://images.unsplash.com/photo-1519066629447-267fffa62d5b?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "snack-04",
    name: "Bánh Quy Hạt Ca Cao",
    description:
      "Những chiếc cookie giòn thơm, phủ hạt cacao và socola chip tan chảy.",
    price: 32000,
    category: "snack",
    imageUrl:
      "https://images.unsplash.com/photo-1505253758473-96b7015fcd40?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "milk-tea-05",
    name: "Trà Sữa Socola",
    description:
      "Sữa tươi hòa quyện bột cacao nguyên chất, điểm thêm trân châu trắng mềm.",
    price: 47000,
    category: "milk-tea",
    imageUrl:
      "https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "topping-06",
    name: "Bánh Flan Caramel",
    description:
      "Caramel vàng óng, kết hợp flan trứng béo nhẹ, mềm mịn tan trong miệng.",
    price: 28000,
    category: "snack",
    imageUrl:
      "https://images.unsplash.com/photo-1481391032119-d89fee407e44?auto=format&fit=crop&w=800&q=80",
    inStock: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
