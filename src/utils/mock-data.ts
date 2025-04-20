/* eslint-disable @typescript-eslint/no-unused-vars */
// Datos simulados de tours
export const mockTours = [
  {
    id: "e9cbb500-8c57-4225-a3de-5673423b438c",
    name: "Exploración Volcán de Santa Ana",
    description:
      "Ascenso guiado al majestuoso volcán Ilamatepec, disfrutando vistas panorámicas y un merecido descanso en aguas termales al finalizar.",
    price: 20.99,
    departure_point: "Multiplaza, San Salvador",
    address: "Volcán de Santa Ana, Cerro Verde",
    country: "El Salvador",
  },
  {
    id: "f7a2b3c4-5d6e-7f8g-9h0i-1j2k3l4m5n6o",
    name: "Ruta de las Flores",
    description:
      "Recorrido por los pintorescos pueblos de la Ruta de las Flores, con visitas a cascadas y degustación de gastronomía local.",
    price: 35.5,
    departure_point: "Centro Comercial Galerías, San Salvador",
    address: "Ruta de las Flores, Sonsonate",
    country: "El Salvador",
  },
  {
    id: "7p8q9r0s-1t2u-3v4w-5x6y-7z8a9b0c1d2e",
    name: "Playa El Tunco",
    description:
      "Día de playa en El Tunco, con clases de surf para principiantes y tiempo libre para disfrutar del mar y la gastronomía local.",
    price: 25.0,
    departure_point: "Metrocentro, San Salvador",
    address: "Playa El Tunco, La Libertad",
    country: "El Salvador",
  },
  {
    id: "3f4g5h6i-7j8k-9l0m-1n2o-3p4q5r6s7t8u",
    name: "Suchitoto Colonial",
    description:
      "Visita a la ciudad colonial de Suchitoto, con recorrido por sus calles empedradas, iglesias y talleres artesanales.",
    price: 18.75,
    departure_point: "Plaza Mundo, Soyapango",
    address: "Suchitoto, Cuscatlán",
    country: "El Salvador",
  },
];

// Fechas disponibles para los tours
export const mockTourDates = [
  {
    id: "077ef933-9a99-4fa3-9ae3-98ffeca1861e",
    product_id: "e9cbb500-8c57-4225-a3de-5673423b438c",
    date: "2025-02-20T07:00:00Z",
    available_spots: 10,
  },
  {
    id: "177ef933-9a99-4fa3-9ae3-98ffeca1861f",
    product_id: "e9cbb500-8c57-4225-a3de-5673423b438c",
    date: "2025-06-22T07:00:00Z",
    available_spots: 10,
  },
  {
    id: "277ef933-9a99-4fa3-9ae3-98ffeca1861g",
    product_id: "f7a2b3c4-5d6e-7f8g-9h0i-1j2k3l4m5n6o",
    date: "2025-03-15T08:00:00Z",
    available_spots: 15,
  },
  {
    id: "377ef933-9a99-4fa3-9ae3-98ffeca1861h",
    product_id: "f7a2b3c4-5d6e-7f8g-9h0i-1j2k3l4m5n6o",
    date: "2025-05-10T08:00:00Z",
    available_spots: 15,
  },
  {
    id: "477ef933-9a99-4fa3-9ae3-98ffeca1861i",
    product_id: "7p8q9r0s-1t2u-3v4w-5x6y-7z8a9b0c1d2e",
    date: "2025-04-05T09:00:00Z",
    available_spots: 20,
  },
  {
    id: "577ef933-9a99-4fa3-9ae3-98ffeca1861j",
    product_id: "3f4g5h6i-7j8k-9l0m-1n2o-3p4q5r6s7t8u",
    date: "2025-03-28T08:30:00Z",
    available_spots: 12,
  },
];

// Datos simulados de usuarios
export const mockUsers = [
  {
    id: "user_2veqnkB4eeA75VaFcmN9YgQlX6H",
    name: "Carlos Martínez",
    email: "carlos.martinez@example.com",
    username: "carlosm",
    lastname: "Martínez",
  },
  {
    id: "user_3wErTyUiOpAsDfGhJkLzXcVbNm",
    name: "Ana López",
    email: "ana.lopez@example.com",
    username: "analopez",
    lastname: "López",
  },
  {
    id: "user_4qWeRtYuIoPasdFgHjKlZxCvBn",
    name: "Juan Pérez",
    email: "juan.perez@example.com",
    username: "juanperez",
    lastname: "Pérez",
  },
  {
    id: "user_5aZsXcDvFbGnHjMkLpOiUyTrEw",
    name: "María Rodríguez",
    email: "maria.rodriguez@example.com",
    username: "mariarodriguez",
    lastname: "Rodríguez",
  },
  {
    id: "user_6qAzWsXeDcRfVtGbYhNjUmIkOl",
    name: "José Hernández",
    email: "jose.hernandez@example.com",
    username: "josehernandez",
    lastname: "Hernández",
  },
  {
    id: "user_7pLkMjNhBgVfCdXsZaQwErTy",
    name: "Laura Sánchez",
    email: "laura.sanchez@example.com",
    username: "laurasanchez",
    lastname: "Sánchez",
  },
];

// Función para generar un ID aleatorio
function generateId() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

// Función para obtener un elemento aleatorio de un array
function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

// Función para generar una fecha aleatoria en los últimos 3 meses
function getRandomDate() {
  const now = new Date();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(now.getMonth() - 3);

  return new Date(
    threeMonthsAgo.getTime() +
      Math.random() * (now.getTime() - threeMonthsAgo.getTime())
  ).toISOString();
}

// Función para generar un número aleatorio entre min y max
function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Generar datos simulados de reservas
export const mockBookings = Array.from({ length: 50 }, (_, i) => {
  const user = getRandomItem(mockUsers);
  const tourDate = getRandomItem(mockTourDates);
  const tour = mockTours.find((t) => t.id === tourDate.product_id)!;
  const tickets = getRandomNumber(1, 5);
  const total = (tour.price * tickets).toFixed(2);
  const status = getRandomItem([
    "completed",
    "pending",
    "cancelled",
    "completed",
    "completed",
  ]); // Más probabilidad de completado
  const paymentMethod = getRandomItem(["credit", "debit", "paypal", "cash"]);

  return {
    id: generateId(),
    user_id: user.id,
    user: user,
    product_id: tour.id,
    tour_name: tour.name,
    tour_date: tourDate.date,
    tour_date_id: tourDate.id,
    status,
    is_live: status !== "cancelled",
    tickets,
    total,
    paymentMethod,
    idTransaccion: generateId().substring(0, 8),
    created_at: getRandomDate(),
    updated_at: getRandomDate(),
  };
});
