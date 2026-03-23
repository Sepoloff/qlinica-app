import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../constants/Colors';
import { Rating } from './Rating';
import { Button } from './Button';
import { reviewService } from '../services/reviewService';

interface ReviewModalProps {
  bookingId: string;
  therapistId: string;
  therapistName: string;
  onSubmit: (review: any) => void;
  onClose: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  bookingId,
  therapistId,
  therapistName,
  onSubmit,
  onClose,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);

  const isValid = rating > 0 && comment.trim().length >= 10;
  const minChars = 10;

  const handleCommentChange = (text: string) => {
    setComment(text);
    setCharCount(text.length);
  };

  const handleSubmit = async () => {
    if (!isValid) {
      setError('Preencha todos os campos corretamente');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const review = await reviewService.submitReview({
        bookingId,
        therapistId,
        rating,
        comment: comment.trim(),
      });

      onSubmit(review);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao submeter avaliação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Avalie sua experiência</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Therapist Info */}
        <View style={styles.therapistInfo}>
          <Text style={styles.therapistLabel}>Com:</Text>
          <Text style={styles.therapistName}>{therapistName}</Text>
        </View>

        {/* Rating Section */}
        <View style={styles.section}>
          <Text style={styles.label}>Como foi sua consulta?</Text>
          <View style={styles.ratingContainer}>
            <View style={styles.largeRatingContainer}>
              <Rating
                value={rating}
                onRate={setRating}
                readOnly={false}
                size="large"
                showValue={false}
              />
            </View>
            {rating > 0 && (
              <Text style={styles.ratingLabel}>
                {reviewService.getRatingLabel(rating)}
              </Text>
            )}
          </View>
        </View>

        {/* Comment Section */}
        <View style={styles.section}>
          <View style={styles.commentHeader}>
            <Text style={styles.label}>Deixe um comentário</Text>
            <Text
              style={[
                styles.charCount,
                charCount >= minChars && styles.charCountValid,
              ]}
            >
              {charCount}/{150}
            </Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Compartilhe sua experiência (mínimo 10 caracteres)..."
            placeholderTextColor={COLORS.grey}
            value={comment}
            onChangeText={handleCommentChange}
            multiline
            maxLength={150}
            numberOfLines={4}
            editable={!loading}
          />

          {charCount > 0 && charCount < minChars && (
            <Text style={styles.helperText}>
              {minChars - charCount} caracteres restantes
            </Text>
          )}
        </View>

        {/* Rating Scale Info */}
        <View style={styles.scaleInfo}>
          <Text style={styles.scaleTitle}>Escala de avaliação:</Text>
          {[
            { star: 5, label: 'Excelente' },
            { star: 4, label: 'Muito Bom' },
            { star: 3, label: 'Bom' },
            { star: 2, label: 'Insatisfeito' },
            { star: 1, label: 'Muito Insatisfeito' },
          ].map((item) => (
            <View key={item.star} style={styles.scaleItem}>
              <Rating value={item.star} readOnly size="small" showValue={false} />
              <Text style={styles.scaleLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.footer}>
        <Button
          title="Cancelar"
          variant="secondary"
          onPress={onClose}
          disabled={loading}
        />
        <Button
          title={loading ? 'Enviando...' : 'Avaliar'}
          variant="primary"
          onPress={handleSubmit}
          disabled={!isValid || loading}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryDark,
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gold + '20',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'DMSans',
  },
  closeButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: COLORS.grey,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  therapistInfo: {
    marginBottom: 24,
    padding: 12,
    backgroundColor: COLORS.gold + '10',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
  },
  therapistLabel: {
    fontSize: 12,
    color: COLORS.grey,
    fontFamily: 'DMSans',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  therapistName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'DMSans',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'DMSans',
    marginBottom: 12,
  },
  ratingContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: COLORS.navy + '50',
    borderRadius: 12,
  },
  largeRatingContainer: {
    marginBottom: 12,
  },
  ratingLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.gold,
    fontFamily: 'DMSans',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  charCount: {
    fontSize: 12,
    color: COLORS.grey,
    fontFamily: 'DMSans',
  },
  charCountValid: {
    color: COLORS.gold,
  },
  input: {
    backgroundColor: COLORS.navy + '50',
    borderWidth: 1,
    borderColor: COLORS.gold + '30',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: COLORS.white,
    fontFamily: 'DMSans',
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.grey,
    fontFamily: 'DMSans',
    marginTop: 8,
  },
  scaleInfo: {
    marginBottom: 24,
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: COLORS.navy + '30',
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
  },
  scaleTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gold,
    fontFamily: 'DMSans',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  scaleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  scaleLabel: {
    fontSize: 13,
    color: COLORS.white,
    fontFamily: 'DMSans',
  },
  errorContainer: {
    backgroundColor: '#F4433640',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#F44336',
  },
  errorText: {
    fontSize: 13,
    color: '#FF9999',
    fontFamily: 'DMSans',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});
