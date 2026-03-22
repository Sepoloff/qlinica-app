# Contributing to Qlinica App

Guia para contribuidores da aplicação Qlinica.

## 📋 Pré-requisitos

- Node.js 14+
- npm ou yarn
- Git
- Expo CLI (`npm install -g expo-cli`)
- Conta GitHub
- Um editor de código (VSCode recomendado)

## 🏗️ Estrutura do Projeto

```
src/
├── screens/          # Telas da aplicação
├── components/       # Componentes reutilizáveis
├── hooks/           # Custom React hooks
├── services/        # Serviços de API e lógica de negócio
├── context/         # Context API providers
├── constants/       # Constantes (cores, dados, etc)
├── utils/           # Funções utilitárias
└── config/          # Configurações (API base URL, etc)
```

## 🚀 Fluxo de Desenvolvimento

### 1. Setup Inicial

```bash
# Clone o repositório
git clone https://github.com/Sepoloff/qlinica-app.git
cd qlinica-app

# Instale as dependências
npm install

# Crie uma branch para sua feature
git checkout -b feature/sua-feature-aqui
```

### 2. Desenvolvimento

```bash
# Inicie o servidor de desenvolvimento
npm start

# Para iOS (macOS)
npm run ios

# Para Android
npm run android

# Para Web
npm run web
```

### 3. Commits

**Padrão de Commit Messages:**

```
type(scope): description

[optional body]
[optional footer]
```

**Tipos:**
- `feat` - Nova funcionalidade
- `fix` - Correção de bug
- `refactor` - Refatoração de código
- `style` - Mudanças de estilo (formatação, etc)
- `docs` - Documentação
- `test` - Testes
- `chore` - Dependências, configurações, etc
- `perf` - Otimizações de performance

**Exemplos:**

```bash
git commit -m "feat(booking): add booking flow context"
git commit -m "fix(auth): fix token refresh logic"
git commit -m "refactor(components): simplify button component"
git commit -m "docs: update README with new hooks"
```

### 4. Push & Pull Request

```bash
# Push para sua branch
git push origin feature/sua-feature-aqui

# Abra uma PR no GitHub
```

**PR Checklist:**
- [ ] Branch atualizada com `main`
- [ ] Testes passando (`npm test`)
- [ ] TypeScript sem erros (`npm run type-check`)
- [ ] Linting passou (`npm run lint`)
- [ ] Commits com mensagens claras
- [ ] Documentação atualizada se necessário

## 🎯 Development Guidelines

### TypeScript

**Sempre use tipos:**

```typescript
// ❌ Evite
const fetchData = (id) => {
  // ...
};

// ✅ Prefira
interface User {
  id: string;
  name: string;
  email: string;
}

const fetchUser = (id: string): Promise<User> => {
  // ...
};
```

### Components

**Estrutura padrão:**

```typescript
'use strict';

import React, { FC, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/Colors';

interface MyComponentProps {
  title: string;
  children: ReactNode;
  onPress?: () => void;
}

/**
 * Descrição do componente
 * 
 * @example
 * <MyComponent title="Título">Conteúdo</MyComponent>
 */
export const MyComponent: FC<MyComponentProps> = ({
  title,
  children,
  onPress,
}) => {
  return (
    <View style={styles.container} onTouchEnd={onPress}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
});
```

### Hooks

**Use hooks customizados para lógica comum:**

```typescript
// Em um component
const { data, loading, error } = useAsync(() => bookingService.getBookings(), {
  autoLoad: true,
});

const { errors, validateField } = useFormValidation();
```

### Services

**Centralizar lógica de API:**

```typescript
class BookingService {
  async getBookings(): Promise<Booking[]> {
    const response = await api.get('/bookings');
    return response.data;
  }
}

export const bookingService = new BookingService();
```

## 🎨 Design System

### Cores

Usar apenas cores definidas em `src/constants/Colors.ts`:

```typescript
import { COLORS } from '@/constants/Colors';

// ✅ Correto
backgroundColor: COLORS.gold

// ❌ Evite
backgroundColor: '#D4AF8F'
```

### Tipografia

- **Títulos**: `fontFamily: 'Cormorant'`
- **Body**: `fontFamily: 'DMSans'`

```typescript
const styles = StyleSheet.create({
  title: {
    fontFamily: 'Cormorant',
    fontSize: 24,
    fontWeight: '700',
  },
  body: {
    fontFamily: 'DMSans',
    fontSize: 14,
    fontWeight: '400',
  },
});
```

## 📝 Documentação

### JSDoc Comments

Adicione comentários em componentes e hooks públicos:

```typescript
/**
 * Botão reutilizável com múltiplas variantes
 * 
 * @param {string} title - Texto do botão
 * @param {() => void} onPress - Callback ao pressionar
 * @param {'primary' | 'secondary'} variant - Estilo do botão
 * @returns {JSX.Element} Componente Button
 * 
 * @example
 * <Button
 *   title="Agendar"
 *   onPress={() => {}}
 *   variant="primary"
 * />
 */
export const Button: FC<ButtonProps> = ({ title, onPress, variant = 'primary' }) => {
  // ...
};
```

### Arquivos README

- Componentes complexos devem ter README na pasta
- Serviços devem ter exemplo de uso

## 🧪 Testing

### Padrão de Testes

```typescript
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Button } from '@/components';

describe('Button Component', () => {
  it('should render with correct title', () => {
    render(<Button title="Clique" onPress={() => {}} />);
    expect(screen.getByText('Clique')).toBeDefined();
  });

  it('should call onPress when pressed', () => {
    const onPress = jest.fn();
    render(<Button title="Clique" onPress={onPress} />);
    fireEvent.press(screen.getByText('Clique'));
    expect(onPress).toHaveBeenCalled();
  });
});
```

## 🔍 Code Review

### Pontos a Verificar

1. **TypeScript**: Sem erros de tipo
2. **Naming**: Nomes claros e descritivos
3. **Performance**: Sem renders desnecessários
4. **Segurança**: Sem dados sensíveis no frontend
5. **Acessibilidade**: Suporte a leitores de tela
6. **Testes**: Funcionalidade testada
7. **Documentação**: Código documentado

## 📦 Dependências

### Adicionando novas dependências

```bash
# Sempre pedir aprovação antes
npm install novo-pacote

# Commit com precisão
git commit -m "chore(deps): add novo-pacote for feature-x"
```

### Removendo dependências

```bash
npm uninstall pacote-antigo
git commit -m "chore(deps): remove pacote-antigo"
```

## 🐛 Reporting Bugs

**Ao encontrar um bug:**

1. Verifique se já existe issue similar
2. Crie uma issue com:
   - Descrição clara do problema
   - Steps para reproduzir
   - Comportamento esperado vs atual
   - Screenshots/videos se aplicável
   - Versão do OS e device

## 🚀 Releases

### Versionamento

Usamos Semantic Versioning (MAJOR.MINOR.PATCH):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backwards compatible)
- **PATCH**: Bug fixes

Exemplo: `v1.2.3`

### Processo de Release

1. Atualize versão em `package.json` e `app.json`
2. Atualize `CHANGELOG.md`
3. Crie tag no Git: `git tag v1.2.3`
4. Push changes e tags: `git push --tags`
5. GitHub Actions faz build automaticamente

## 💬 Comunicação

- **Issues**: Para bugs e feature requests
- **Discussions**: Para perguntas e ideias
- **PR Comments**: Para code review específico
- **Email**: Para questões sensíveis

## 📚 Recursos Úteis

- [React Native Docs](https://reactnative.dev)
- [Expo Docs](https://docs.expo.dev)
- [React Navigation](https://reactnavigation.org)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## 🎓 Padrões Internos

### Pasta de Componentes

```
src/components/
├── MyComponent.tsx       # Componente
├── MyComponent.test.tsx  # Testes
└── MyComponent.stories.tsx # Storybook (opcional)
```

### Pasta de Hooks

```
src/hooks/
├── useMyHook.ts         # Hook
└── useMyHook.test.ts    # Testes
```

### Pasta de Services

```
src/services/
├── myService.ts         # Serviço
├── myService.types.ts   # Types
└── myService.test.ts    # Testes
```

## ✅ Checklist para PR

- [ ] Branch está atualizada com `main`
- [ ] Code segue padrões do projeto
- [ ] TypeScript sem erros
- [ ] Testes adicionados/atualizados
- [ ] Documentação atualizada
- [ ] Commits com mensagens claras
- [ ] Nenhuma console.log ou debug code
- [ ] Performance verificada
- [ ] Responsive em diferentes tamanhos

---

**Obrigado por contribuir! 🙏**

Para dúvidas, abra uma issue ou entre em contato. Happy coding! 🚀
