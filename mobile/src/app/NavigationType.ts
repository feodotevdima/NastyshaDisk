import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  Home: undefined;
  Sheare: { path: string };
};

export type SheareScreenProps = NativeStackScreenProps<RootStackParamList, 'Sheare'>;