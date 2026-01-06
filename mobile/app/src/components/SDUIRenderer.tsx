// ════════════════════════════════════════════════════════════════
//                    SDUI Renderer
//                    Kamaleon Mobile App
// ════════════════════════════════════════════════════════════════

import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

type SDUIComponent = {
  type: string;
  id: string;
  props?: Record<string, any>;
  style?: ViewStyle | TextStyle;
  children?: SDUIComponent[];
  text?: string;
  actions?: SDUIAction[];
};

type SDUIAction = {
  type: 'navigate' | 'submit' | 'api' | 'custom';
  payload: Record<string, any>;
};

interface SDUIRendererProps {
  components: SDUIComponent[];
  onAction?: (action: SDUIAction) => void;
}

const componentRegistry: Record<string, React.FC<any>> = {};

// Container component
const SDUIContainer: React.FC<{
  component: SDUIComponent;
  onAction?: (action: SDUIAction) => void;
}> = ({ component, onAction }) => {
  return (
    <View style={[styles.container, component.style]}>
      {component.children?.map((child) => (
        <SDUIComponentRenderer
          key={child.id}
          component={child}
          onAction={onAction}
        />
      ))}
    </View>
  );
};

// Text component
const SDUIText: React.FC<{ component: SDUIComponent }> = ({ component }) => {
  const variant = component.props?.variant || 'body';
  const variantStyle = textVariants[variant] || textVariants.body;

  return (
    <Text style={[variantStyle, component.style]}>
      {component.text || component.props?.text}
    </Text>
  );
};

// Button component
const SDUIButton: React.FC<{
  component: SDUIComponent;
  onAction?: (action: SDUIAction) => void;
}> = ({ component, onAction }) => {
  const variant = component.props?.variant || 'primary';
  const buttonStyle = buttonVariants[variant] || buttonVariants.primary;

  const handlePress = () => {
    if (component.actions?.[0] && onAction) {
      onAction(component.actions[0]);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, buttonStyle.container, component.style]}
      onPress={handlePress}
      disabled={component.props?.disabled}
    >
      <Text style={buttonStyle.text}>
        {component.text || component.props?.label}
      </Text>
    </TouchableOpacity>
  );
};

// Input component
const SDUIInput: React.FC<{ component: SDUIComponent }> = ({ component }) => {
  const [value, setValue] = React.useState(component.props?.value || '');

  return (
    <View style={[styles.inputContainer, component.style]}>
      {component.props?.label && (
        <Text style={styles.inputLabel}>{component.props.label}</Text>
      )}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={setValue}
        placeholder={component.props?.placeholder}
        secureTextEntry={component.props?.type === 'password'}
        keyboardType={component.props?.keyboardType}
      />
    </View>
  );
};

// Image component
const SDUIImage: React.FC<{ component: SDUIComponent }> = ({ component }) => {
  return (
    <Image
      source={{ uri: component.props?.src }}
      style={[styles.image, component.style]}
      resizeMode={component.props?.resizeMode || 'cover'}
    />
  );
};

// Card component
const SDUICard: React.FC<{
  component: SDUIComponent;
  onAction?: (action: SDUIAction) => void;
}> = ({ component, onAction }) => {
  return (
    <View style={[styles.card, component.style]}>
      {component.children?.map((child) => (
        <SDUIComponentRenderer
          key={child.id}
          component={child}
          onAction={onAction}
        />
      ))}
    </View>
  );
};

// List component
const SDUIList: React.FC<{
  component: SDUIComponent;
  onAction?: (action: SDUIAction) => void;
}> = ({ component, onAction }) => {
  return (
    <ScrollView style={component.style}>
      {component.children?.map((child) => (
        <SDUIComponentRenderer
          key={child.id}
          component={child}
          onAction={onAction}
        />
      ))}
    </ScrollView>
  );
};

// Component renderer
const SDUIComponentRenderer: React.FC<{
  component: SDUIComponent;
  onAction?: (action: SDUIAction) => void;
}> = ({ component, onAction }) => {
  // Check custom registry first
  const CustomComponent = componentRegistry[component.type];
  if (CustomComponent) {
    return <CustomComponent component={component} onAction={onAction} />;
  }

  // Built-in components
  switch (component.type) {
    case 'container':
    case 'row':
    case 'column':
      return <SDUIContainer component={component} onAction={onAction} />;
    case 'text':
      return <SDUIText component={component} />;
    case 'button':
      return <SDUIButton component={component} onAction={onAction} />;
    case 'input':
      return <SDUIInput component={component} />;
    case 'image':
      return <SDUIImage component={component} />;
    case 'card':
      return <SDUICard component={component} onAction={onAction} />;
    case 'list':
      return <SDUIList component={component} onAction={onAction} />;
    default:
      console.warn(`Unknown component type: ${component.type}`);
      return null;
  }
};

// Main renderer
export const SDUIRenderer: React.FC<SDUIRendererProps> = ({
  components,
  onAction,
}) => {
  return (
    <View style={styles.root}>
      {components.map((component) => (
        <SDUIComponentRenderer
          key={component.id}
          component={component}
          onAction={onAction}
        />
      ))}
    </View>
  );
};

// Register custom component
export const registerComponent = (
  type: string,
  component: React.FC<any>
) => {
  componentRegistry[type] = component;
};

// Styles
const textVariants: Record<string, TextStyle> = {
  h1: { fontSize: 32, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: '600' },
  body: { fontSize: 16 },
  caption: { fontSize: 12, color: '#666' },
};

const buttonVariants: Record<string, { container: ViewStyle; text: TextStyle }> = {
  primary: {
    container: { backgroundColor: '#1976d2' },
    text: { color: '#fff', fontWeight: '600' },
  },
  secondary: {
    container: { backgroundColor: '#f5f5f5', borderWidth: 1, borderColor: '#ddd' },
    text: { color: '#333', fontWeight: '600' },
  },
  danger: {
    container: { backgroundColor: '#d32f2f' },
    text: { color: '#fff', fontWeight: '600' },
  },
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    padding: 8,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  inputContainer: {
    marginVertical: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
