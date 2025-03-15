import React, { useRef, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import SimpleGradientButton from "@/components/ui/SimpleGradientButton";
import { Category } from "@/types";

/**
 * Props pour la liste de catégories
 */
interface CategoryListProps {
  /** Liste des catégories à afficher */
  categories: Category[];
  /** ID de la catégorie actuellement sélectionnée */
  selectedCategoryId: string;
  /** Fonction appelée lors de la sélection d'une catégorie */
  onSelectCategory: (categoryId: string) => void;
}

 
const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
}) => { 
  
  const scrollViewRef = useRef<ScrollView>(null);
  const buttonWidths = useRef<{ [key: string]: number }>({});
  const totalLeftOffset = useRef<{ [key: string]: number }>({});

 
  const measureButton = (
    categoryId: string,
    width: number,
    x: number,
  ): void => {
    buttonWidths.current[categoryId] = width;
    totalLeftOffset.current[categoryId] = x;
  };

  /**
   * Défile automatiquement vers la catégorie sélectionnée
   */
  useEffect(() => {
    if (
      selectedCategoryId &&
      totalLeftOffset.current[selectedCategoryId] !== undefined
    ) {
      scrollViewRef.current?.scrollTo({
        x: totalLeftOffset.current[selectedCategoryId],
        animated: true,
      });
    }
  }, [selectedCategoryId]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        accessibilityRole="tablist"
      >
        {categories.map((category) => (
          <View
            key={category.id}
            onLayout={({ nativeEvent }) => {
              measureButton(
                category.id,
                nativeEvent.layout.width,
                nativeEvent.layout.x,
              );
            }}
            accessibilityRole="tab"
            accessibilityLabel={category.name}
            accessibilityState={{
              selected: selectedCategoryId === category.id,
            }}
          >
            <SimpleGradientButton
              title={category.name}
              onPress={() => onSelectCategory(category.id)}
              isSelected={selectedCategoryId === category.id}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    marginVertical: 10,
    marginTop: 30,
  },
});

export default CategoryList;
