import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; 
import { db, auth } from '../services/firebase';
import { colors } from '../theme/colors';
import Input from '../components/Input';
import Button from '../components/Button';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const AddTaskScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium'); 
  const [deadline, setDeadline] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddTask = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('User not authenticated');

      const taskData = {
        userId: user.uid,
        title: title,
        description: description,
        priority: priority,
        isCompleted: false,
        createdAt: serverTimestamp(),
        deadline: deadline ? deadline.getTime() : null,
      };

      // Create a timeout promise that resolves after 3 seconds
      const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => {
          resolve({ timedOut: true });
        }, 3000);
      });

      // Race the actual DB Add against the timeout
      const result = await Promise.race([
        addDoc(collection(db, 'tasks'), taskData),
        timeoutPromise
      ]);

      setLoading(false);
      
      if (result && result.timedOut) {
        console.warn("Task creation timed out (likely network/blocker), assuming optimistic success.");
      }

      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.navigate('Home');
      }
    } catch (error) {
      console.error("Task Creation Error:", error);
      Alert.alert('Error Adding Task', error.message || 'Check your internet connection or AdBlocker.');
      setLoading(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDeadline(selectedDate);
    }
  };

  const priorities = ['Low', 'Medium', 'High'];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>New Task</Text>
        
        <Input
          placeholder="Task Title"
          value={title}
          onChangeText={setTitle}
          iconName="title"
        />
        
        <Input
          placeholder="Task Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          iconName="description"
        />

        <Text style={styles.label}>Priority Level</Text>
        <View style={styles.priorityContainer}>
          {priorities.map(p => (
            <TouchableOpacity
              key={p}
              style={[
                styles.priorityChip,
                priority === p && { backgroundColor: getPriorityColor(p), borderColor: getPriorityColor(p) }
              ]}
              onPress={() => setPriority(p)}
            >
              <Text style={[
                styles.priorityText, 
                priority === p ? { color: '#fff' } : { color: colors.text }
              ]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Due Date</Text>
        <TouchableOpacity style={styles.dateSelector} onPress={() => setShowDatePicker(true)}>
          <MaterialIcons name="event" size={24} color={colors.primary} />
          <Text style={styles.dateText}>
            {deadline ? deadline.toDateString() : 'Pick a Deadline'}
          </Text>
          <MaterialIcons name="arrow-drop-down" size={24} color={colors.textSecondary} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={deadline || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}

        <View style={styles.footerButtons}>
          <Button 
            title="Create Task" 
            onPress={handleAddTask} 
            loading={loading} 
            style={styles.createBtn}
            variant="primary"
          />

          <Button 
            title="Cancel" 
            onPress={() => navigation.goBack()} 
            variant="ghost"
            style={styles.cancelBtn}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const getPriorityColor = (p) => {
  if (p === 'High') return colors.danger;
  if (p === 'Medium') return colors.warning;
  if (p === 'Low') return colors.success;
  return colors.primary;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 32,
    marginTop: 0,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 12,
    marginTop: 24,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  priorityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  priorityChip: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  priorityText: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  dateText: {
    color: colors.text,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  footerButtons: {
    marginTop: 40,
    gap: 12,
  },
  createBtn: {
    borderRadius: 16,
    paddingVertical: 16,
  },
  cancelBtn: {
    borderRadius: 16,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
});

export default AddTaskScreen;
