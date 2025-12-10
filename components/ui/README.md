# 🎨 Design System - Documentation

## Vue d'ensemble

Ce design system fournit des composants UI cohérents et réutilisables pour l'application.

## 📦 Composants Disponibles

### Button
Bouton avec différents variants et tailles.

```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md" onPress={handlePress}>
  Cliquer ici
</Button>
```

**Props :**
- `variant`: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' (défaut: 'primary')
- `size`: 'sm' | 'md' | 'lg' (défaut: 'md')
- `disabled`: boolean (défaut: false)
- `loading`: boolean (défaut: false)
- `fullWidth`: boolean (défaut: false)
- `onPress`: () => void (requis)

### Input
Champ de saisie avec label et gestion d'erreurs.

```tsx
import { Input } from '@/components/ui';

<Input
  label="Nom"
  placeholder="Entrez votre nom"
  value={value}
  onChangeText={setValue}
  error={error}
/>
```

**Props :**
- `label`: string (optionnel)
- `error`: string (optionnel)
- `helperText`: string (optionnel)
- `size`: 'sm' | 'md' | 'lg' (défaut: 'md')
- Toutes les props de TextInput

### Card
Conteneur avec variantes.

```tsx
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui';

<Card variant="elevated">
  <CardHeader>
    <Text>Titre</Text>
  </CardHeader>
  <CardContent>
    <Text>Contenu</Text>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

**Props :**
- `variant`: 'elevated' | 'outlined' | 'filled' (défaut: 'elevated')
- `padding`: number (optionnel, défaut: 16)

### Badge
Petit label coloré.

```tsx
import { Badge } from '@/components/ui';

<Badge variant="success" size="md">
  Actif
</Badge>
```

**Props :**
- `variant`: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info' | 'neutral'
- `size`: 'sm' | 'md' | 'lg' (défaut: 'md')

### LoadingSpinner
Indicateur de chargement.

```tsx
import { LoadingSpinner } from '@/components/ui';

<LoadingSpinner message="Chargement..." size="large" />
```

**Props :**
- `message`: string (optionnel)
- `size`: 'small' | 'large' (défaut: 'large')
- `color`: string (optionnel)

## 🎨 Constants

### Colors
Palette de couleurs pour light et dark mode.

```tsx
import { Colors } from '@/constants/Colors';
import { useThemeColors } from '@/hooks/useThemeColors';

// Dans un composant
const colors = useThemeColors();
<View style={{ backgroundColor: colors.primary }} />
```

**Couleurs disponibles :**
- Primary: `primary`, `primaryDark`, `primaryLight`
- Secondary: `secondary`, `secondaryDark`, `secondaryLight`
- Status: `success`, `error`, `warning`, `info`
- Text: `text`, `textSecondary`, `textTertiary`
- Background: `background`, `backgroundSecondary`, `backgroundTertiary`
- Autres: `border`, `card`, `disabled`

**Couleurs spéciales :**
- `SessionTypeColors`: couleurs pour AMRAP, HIIT, EMOM, CUSTOM
- `ExerciseCategoryColors`: couleurs pour cardio, strength, mobility

### Spacing
Système d'espacement cohérent.

```tsx
import { Spacing, Layout } from '@/constants/Spacing';

<View style={{ padding: Spacing.md, gap: Spacing.sm }} />
<View style={{ borderRadius: Layout.borderRadius.md }} />
```

**Espacements :**
- `xs`: 4px
- `sm`: 8px
- `md`: 16px (base)
- `lg`: 24px
- `xl`: 32px
- `xxl`: 48px
- `xxxl`: 64px

**Layout helpers :**
- `screenPadding`: 16px
- `cardPadding`: 16px
- `borderRadius`: { sm: 4, md: 8, lg: 12, xl: 16, full: 9999 }
- `shadow`: { small, medium, large }

### Typography
Styles de texte prédéfinis.

```tsx
import { TextStyles, FontSize } from '@/constants/Typography';

<Text style={TextStyles.h1}>Titre</Text>
<Text style={TextStyles.body}>Paragraphe</Text>
```

**Styles disponibles :**
- Headings: `h1`, `h2`, `h3`, `h4`, `h5`
- Body: `bodyLarge`, `body`, `bodySmall`
- Labels: `label`, `labelLarge`
- Autres: `caption`, `button`, `timer`

## 🚀 Utilisation

### Import simple
```tsx
import { Button, Input, Card, Badge } from '@/components/ui';
```

### Avec le thème
```tsx
import { useThemeColors } from '@/hooks/useThemeColors';

function MyComponent() {
  const colors = useThemeColors();

  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>Hello</Text>
    </View>
  );
}
```

## 📸 Démo

Pour voir tous les composants en action, lancez l'app et naviguez vers :
```
/design-system-demo
```

## 🎯 Bonnes Pratiques

1. **Toujours utiliser les constants** au lieu de valeurs en dur
   ❌ `padding: 16`
   ✅ `padding: Spacing.md`

2. **Utiliser useThemeColors** pour les couleurs
   ❌ `color: '#000000'`
   ✅ `color: colors.text`

3. **Composer les composants** au lieu de tout refaire
   ```tsx
   <Card>
     <Input label="Nom" />
     <Button>Valider</Button>
   </Card>
   ```

4. **Réutiliser les styles de texte**
   ❌ `fontSize: 24, fontWeight: 'bold'`
   ✅ `...TextStyles.h3`

## 🔮 Prochaines Étapes

- [ ] Dark mode complet avec toggle
- [ ] Animations sur les transitions
- [ ] Plus de composants (Switch, Slider, Modal, etc.)
- [ ] Storybook pour documentation interactive
