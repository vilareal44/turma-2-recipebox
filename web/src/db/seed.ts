import { db } from './index';
import { recipes } from './schema';

async function seed() {
  await db.insert(recipes).values([
    {
      title: 'Classic Pancakes',
      description: 'Fluffy, golden pancakes perfect for a lazy weekend morning.',
      category: 'breakfast',
      prepTime: 10,
      cookTime: 20,
      servings: 4,
      ingredients: JSON.stringify([
        '1 cup all-purpose flour',
        '2 tbsp sugar',
        '1 tsp baking powder',
        '1/2 tsp baking soda',
        '1 cup buttermilk',
        '1 egg',
        '2 tbsp melted butter',
      ]),
      instructions: JSON.stringify([
        'Whisk together flour, sugar, baking powder, and baking soda in a large bowl.',
        'In another bowl, whisk buttermilk, egg, and melted butter.',
        'Pour wet ingredients into dry and stir until just combined (lumps are okay).',
        'Heat a skillet over medium heat and grease lightly.',
        'Pour 1/4 cup batter per pancake. Cook until bubbles form, then flip.',
        'Serve warm with maple syrup.',
      ]),
      imageUrl: null,
    },
    {
      title: 'Spaghetti Carbonara',
      description: 'A rich and creamy Roman pasta made with eggs, cheese, pancetta, and pepper.',
      category: 'dinner',
      prepTime: 10,
      cookTime: 20,
      servings: 2,
      ingredients: JSON.stringify([
        '200g spaghetti',
        '100g pancetta or guanciale',
        '2 large eggs',
        '50g Pecorino Romano, grated',
        '50g Parmesan, grated',
        'Black pepper to taste',
        'Salt for pasta water',
      ]),
      instructions: JSON.stringify([
        'Cook spaghetti in well-salted boiling water until al dente, reserving 1 cup pasta water.',
        'Fry pancetta in a pan until crispy. Remove from heat.',
        'Whisk eggs and grated cheese together in a bowl.',
        'Add hot pasta to the pancetta pan off the heat. Toss to combine.',
        'Add egg-cheese mixture and a splash of pasta water. Toss quickly to create a creamy sauce.',
        'Season generously with black pepper and serve immediately.',
      ]),
      imageUrl: null,
    },
    {
      title: 'Chocolate Chip Cookies',
      description: 'Crispy on the edges, chewy in the center — the perfect cookie.',
      category: 'dessert',
      prepTime: 15,
      cookTime: 12,
      servings: 24,
      ingredients: JSON.stringify([
        '2 1/4 cups all-purpose flour',
        '1 tsp baking soda',
        '1 tsp salt',
        '1 cup (2 sticks) butter, softened',
        '3/4 cup granulated sugar',
        '3/4 cup packed brown sugar',
        '2 large eggs',
        '2 tsp vanilla extract',
        '2 cups chocolate chips',
      ]),
      instructions: JSON.stringify([
        'Preheat oven to 375°F (190°C).',
        'Mix flour, baking soda, and salt in a bowl.',
        'Beat butter and both sugars until creamy.',
        'Add eggs and vanilla to butter mixture and mix well.',
        'Gradually stir in flour mixture.',
        'Fold in chocolate chips.',
        'Drop rounded tablespoons onto ungreased baking sheets.',
        'Bake 9–11 minutes or until golden brown. Cool on wire racks.',
      ]),
      imageUrl: null,
    },
  ]);
  console.log('Seeded 3 recipes.');
}

seed().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
