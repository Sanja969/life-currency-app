import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Životna valuta</Text>

      <Text style={styles.subtitle}>
        Prati na šta svakog dana trošiš svoju najvredniju valutu — vreme.
      </Text>

      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>Još nema aktivnosti</Text>

        <Text style={styles.emptyDescription}>
          Ovde će se prikazivati aktivnosti koje zabeležiš danas.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    marginTop: 16,
    fontSize: 30,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 23,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  emptyDescription: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 15,
    lineHeight: 21,
  },
});