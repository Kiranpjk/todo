import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Platform, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { MaterialIcons } from '@expo/vector-icons';
import { setTasks, setFilter } from '../store/taskSlice';
import { logout } from '../store/authSlice';
import { colors } from '../theme/colors';
import TaskCard from '../components/TaskCard';

// ... (existing helper functions: renderHeader, renderFilters)

const HomeScreen = ({ navigation }) => {
  const { user } = useSelector(state => state.auth);
  // ... (rest of logic)
  const { tasks } = useSelector(state => state.tasks);
  const dispatch = useDispatch();
  const [filter, setFilterState] = useState('All'); 

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    
    console.log("Subscribing to tasks for user:", user.uid);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasksList = [];
      querySnapshot.forEach((doc) => {
        tasksList.push({ ...doc.data(), id: doc.id });
      });
      console.log(`Fetched ${tasksList.length} tasks for user ${user.uid}`);
      dispatch(setTasks(tasksList));
    }, (error) => {
      console.error("Firestore Error:", error);
    });

    return () => unsubscribe();
  }, [user, dispatch]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(logout());
      // Explicitly clear tasks on logout to prevent data leaking between accounts
      dispatch(setTasks([]));
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      const taskRef = doc(db, 'tasks', task.id);
      await updateDoc(taskRef, {
        isCompleted: !task.isCompleted,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not update task');
    }
  };

  const handleDelete = (task) => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'tasks', task.id));
            } catch (error) {
              Alert.alert('Error', 'Could not delete task');
            }
          }
        },
      ]
    );
  };

  const filteredTasks = tasks.filter(task => {
    // SECURITY: Double check the task belongs to the user, 
    // in case Redux wasn't cleared fast enough on logout
    if (task.userId !== user?.uid) return false;
    
    if (filter === 'All') return true;
    if (filter === 'Active') return !task.isCompleted;
    if (filter === 'Done') return task.isCompleted;
    return true;
  });

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>Hello, {user?.displayName || 'User'}</Text>
        <Text style={styles.date}>{new Date().toDateString()}</Text>
      </View>
      <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
        <MaterialIcons name="logout" size={24} color={colors.text} />
      </TouchableOpacity>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filterContainer}>
      {['All', 'Active', 'Done'].map(f => (
        <TouchableOpacity 
          key={f} 
          style={[styles.filterChip, filter === f && styles.activeChip]}
          onPress={() => setFilterState(f)}
        >
          <Text style={[styles.filterText, filter === f && styles.activeFilterText]}>{f}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderFilters()}

      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TaskCard 
            task={item} 
            onToggleComplete={() => handleToggleComplete(item)} 
            onDelete={() => handleDelete(item)} 
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tasks found. Add a new one!</Text>
          </View>
        }
      />

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate('AddTask')}
      >
        <MaterialIcons name="add" size={30} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.surface,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  date: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  logoutBtn: {
    padding: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 15,
    justifyContent: 'space-around',
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#FFF',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100, 
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: `0px 4px 4.65px ${colors.primary}4D`, // 4D = 0.3 opacity hex
      },
    }),
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
});

export default HomeScreen;
