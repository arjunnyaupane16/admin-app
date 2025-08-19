import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ConfirmContext = createContext({
  confirm: async () => false,
});

export const ConfirmProvider = ({ children }) => {
  const resolverRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState({
    title: 'Confirm',
    message: 'Are you sure?',
    confirmText: 'OK',
    cancelText: 'Cancel',
    danger: false,
  });

  const hide = useCallback(() => setVisible(false), []);

  const confirm = useCallback(async (opts = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setOptions((prev) => ({ ...prev, ...opts }));
      setVisible(true);
    });
  }, []);

  const onCancel = useCallback(() => {
    hide();
    if (resolverRef.current) resolverRef.current(false);
    resolverRef.current = null;
  }, [hide]);

  const onConfirm = useCallback(() => {
    hide();
    if (resolverRef.current) resolverRef.current(true);
    resolverRef.current = null;
  }, [hide]);

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {/* Global Modal */}
      <Modal
        visible={visible}
        animationType={Platform.OS === 'web' ? 'fade' : 'slide'}
        transparent
        onRequestClose={onCancel}
      >
        <View style={styles.backdrop}>
          <View style={styles.card}>
            {!!options.title && <Text style={styles.title}>{options.title}</Text>}
            {!!options.message && <Text style={styles.message}>{options.message}</Text>}
            <View style={styles.row}>
              <TouchableOpacity style={[styles.btn, styles.cancel]} onPress={onCancel}>
                <Text style={[styles.btnText]}>{options.cancelText || 'Cancel'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, options.danger ? styles.danger : styles.primary]}
                onPress={onConfirm}
              >
                <Text style={[styles.btnText, styles.confirmText]}>
                  {options.confirmText || 'OK'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => useContext(ConfirmContext);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      web: {
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
      },
      default: {
        elevation: 4,
      },
    }),
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
    marginBottom: 6,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  cancel: {
    backgroundColor: '#eee',
  },
  primary: {
    backgroundColor: '#6a1b9a',
  },
  danger: {
    backgroundColor: '#e53935',
  },
  btnText: {
    color: '#111',
    fontWeight: '600',
  },
  confirmText: {
    color: '#fff',
    fontWeight: '700',
  },
});
