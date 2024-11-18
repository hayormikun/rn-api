import { Fragment, useEffect, useState } from "react";
import { Button } from "react-native";
import {
  StyleSheet,
  SafeAreaView,
  StatusBar,
  View,
  FlatList,
  Text,
  ActivityIndicator,
  TextInput,
} from "react-native";

export default function HomeScreen() {
  const [posts, setPosts] = useState<
    {
        userId: number;
        id: number;
        title: string;
        body: string;
      }[]
    | null
  >(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");
  const [isPosting, setIsPosting] = useState<boolean>(false);
  const [error, setError] = useState("");

  const fetchPosts = async (limit = 10) => {
    const resp = await fetch(
      `https://jsonplaceholder.typicode.com/posts?_limit=${limit}`
    );
    const data = await resp.json();
    setPosts(data);
    setIsLoading(false);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    fetchPosts(20);
    setIsRefreshing(false);
  };

  const handlePost = async () => {
    setIsPosting(true);
    try {
      const resp = await fetch(`https://jsonplaceholder.typicode.com/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: postTitle,
          body: postBody,
        }),
      });
      const data = await resp.json();
      setPosts((prev) => [data, ...prev]);
      setIsPosting(false);
      setPostTitle(""), setPostBody("");
    } catch (error) {
      console.log("Failed to fetch data: ", error);
      setIsPosting(false);
      setError("failed to fetch posts");
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size={"large"} color={"#0000ff"} />
        <Text>Loading posts...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="post title"
          value={postTitle}
          onChangeText={setPostTitle}
        />
        <TextInput
          style={[styles.input, { height: 64 }]}
          placeholder="post body..."
          multiline
          value={postBody}
          onChangeText={setPostBody}
        />
        <Button
          title={isPosting ? "submitting..." : "submit post"}
          disabled={isPosting}
          onPress={handlePost}
        />
      </View>
      <Fragment>
        <View style={styles.postsContainer}>
          <FlatList
            data={posts}
            keyExtractor={(item)=> item.id.toString().toLowerCase()}
            renderItem={({ item }) => {
              return (
                <View style={styles.card}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.body}>{item.body}</Text>
                </View>
              );
            }}
            ListEmptyComponent={<Text>No posts found</Text>}
            ItemSeparatorComponent={() => <View style={{ height: 15 }}></View>}
            ListHeaderComponent={<Text style={styles.header}>Post List</Text>}
            ListFooterComponent={<Text style={styles.footer}>End of List</Text>}
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
          />
        </View>
      </Fragment>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: StatusBar.currentHeight,
  },
  postsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  title: {
    fontSize: 30,
  },
  body: {
    fontSize: 24,
    color: "#666666",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  footer: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 12,
  },
  formContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 8,
    padding: 8,
    borderRadius: 8,
  },
});
