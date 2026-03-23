import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { COLORS } from '../constants/Colors';
import { useToast } from '../context/ToastContext';
import { useAnalytics } from '../hooks/useAnalytics';
import { useReviews } from '../hooks/useReviews';
import { ReviewModal } from '../components/ReviewModal';
import { Rating } from '../components/Rating';
import { RatingDisplay } from '../components/RatingDisplay';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { logger } from '../utils/logger';

type ReviewScreenRouteProp = RouteProp<any, 'Review'>;

export default function ReviewScreen() {
  const navigation = useNavigation();
  const route = useRoute<ReviewScreenRouteProp>();
  const { showToast } = useToast();
  const { trackEvent } = useAnalytics();
  const { checkCanReview, getBookingReview, loading } = useReviews();

  const {
    bookingId = '',
    therapistId = '',
    therapistName = 'Terapeuta',
    therapistRating = 0,
  } = (route.params as any) || {};

  const [canReview, setCanReview] = useState(false);
  const [existingReview, setExistingReview] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [checking, setChecking] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      loadReviewStatus();
    }, [bookingId])
  );

  const loadReviewStatus = async () => {
    try {
      setChecking(true);

      // Check if user can review this booking
      const canReviewResult = await checkCanReview(bookingId);
      setCanReview(canReviewResult);

      // Check if review already exists
      const existingReviewData = await getBookingReview(bookingId);
      setExistingReview(existingReviewData);

      if (existingReviewData) {
        showToast('Já avaliou esta consulta', 'info');
      }
    } catch (error) {
      logger.error('Error loading review status:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleReviewSubmit = (review: any) => {
    trackEvent('review_submitted', {
      bookingId,
      rating: review.rating,
    });
    showToast('Avaliação registrada com sucesso', 'success');
    setExistingReview(review);
    setShowReviewModal(false);

    // Navigate back after a short delay
    setTimeout(() => {
      navigation.goBack();
    }, 1500);
  };

  if (checking) {
    return (
      <View style={styles.container}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Avaliação da Consulta</Text>
        </View>

        {/* Therapist Info */}
        <View style={styles.therapistCard}>
          <View style={styles.therapistHeader}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {therapistName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.therapistInfo}>
              <Text style={styles.therapistName}>{therapistName}</Text>
              {therapistRating > 0 && (
                <View style={styles.ratingInfo}>
                  <Rating
                    value={therapistRating}
                    readOnly
                    size="small"
                    showValue={true}
                  />
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Existing Review Section */}
        {existingReview && (
          <View style={styles.existingReviewSection}>
            <Text style={styles.sectionTitle}>Sua Avaliação</Text>
            <View style={styles.existingReviewCard}>
              <View style={styles.reviewHeader}>
                <Rating
                  value={existingReview.rating}
                  readOnly
                  size="medium"
                />
              </View>
              <Text style={styles.reviewComment}>
                {existingReview.comment}
              </Text>
              <Text style={styles.reviewDate}>
                Avaliado em {new Date(existingReview.createdAt).toLocaleDateString('pt-PT')}
              </Text>
            </View>
          </View>
        )}

        {/* No Review Section */}
        {!existingReview && !canReview && (
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Não é possível avaliar</Text>
            <Text style={styles.infoText}>
              Só pode avaliar consultas concluídas. Aguarde pela conclusão da sua consulta para fazer uma avaliação.
            </Text>
          </View>
        )}

        {/* CTA Section */}
        {!existingReview && canReview && (
          <View style={styles.ctaSection}>
            <Text style={styles.ctaTitle}>Partilhe a sua experiência</Text>
            <Text style={styles.ctaText}>
              A sua avaliação ajuda outros utilizadores e melhora a qualidade do nosso serviço.
            </Text>
            <TouchableOpacity
              style={styles.reviewButton}
              onPress={() => setShowReviewModal(true)}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.primaryDark} />
              ) : (
                <Text style={styles.reviewButtonText}>Avaliar Agora</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Review Stats Section */}
        {therapistRating > 0 && (
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Avaliação do Terapeuta</Text>
            <View style={styles.ratingCard}>
              <View style={styles.ratingBig}>
                <Text style={styles.ratingBigValue}>
                  {therapistRating.toFixed(1)}
                </Text>
                <Rating
                  value={therapistRating}
                  readOnly
                  size="small"
                  showValue={false}
                />
              </View>
              <View style={styles.ratingDetails}>
                <Text style={styles.ratingDetailLabel}>
                  Com base em avaliações dos utilizadores
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Review Modal */}
      {showReviewModal && (
        <ReviewModal
          bookingId={bookingId}
          therapistId={therapistId}
          therapistName={therapistName}
          onSubmit={handleReviewSubmit}
          onClose={() => setShowReviewModal(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: COLORS.primaryDark,
  },
  backButton: {
    marginBottom: 12,
  },
  backButtonText: {
    fontSize: 14,
    color: COLORS.gold,
    fontFamily: 'DMSans',
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.white,
    fontFamily: 'Cormorant',
  },
  therapistCard: {
    marginHorizontal: 20,
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
  },
  therapistHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.gold + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.gold,
    fontFamily: 'DMSans',
  },
  therapistInfo: {
    flex: 1,
  },
  therapistName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'DMSans',
    marginBottom: 6,
  },
  ratingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  existingReviewSection: {
    marginHorizontal: 20,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'DMSans',
    marginBottom: 12,
  },
  existingReviewCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
  },
  reviewHeader: {
    marginBottom: 12,
  },
  reviewComment: {
    fontSize: 14,
    color: COLORS.white,
    fontFamily: 'DMSans',
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewDate: {
    fontSize: 12,
    color: COLORS.grey,
    fontFamily: 'DMSans',
    fontStyle: 'italic',
  },
  infoSection: {
    marginHorizontal: 20,
    marginTop: 32,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FF9800' + '15',
    borderRadius: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9800',
    fontFamily: 'DMSans',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.white,
    fontFamily: 'DMSans',
    lineHeight: 18,
  },
  ctaSection: {
    marginHorizontal: 20,
    marginTop: 32,
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.gold + '30',
  },
  ctaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    fontFamily: 'DMSans',
    marginBottom: 8,
  },
  ctaText: {
    fontSize: 13,
    color: COLORS.grey,
    fontFamily: 'DMSans',
    lineHeight: 18,
    marginBottom: 20,
  },
  reviewButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: COLORS.gold,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primaryDark,
    fontFamily: 'DMSans',
  },
  statsSection: {
    marginHorizontal: 20,
    marginTop: 32,
    marginBottom: 40,
  },
  ratingCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  ratingBig: {
    alignItems: 'center',
  },
  ratingBigValue: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.gold,
    fontFamily: 'DMSans',
    marginBottom: 4,
  },
  ratingDetails: {
    flex: 1,
  },
  ratingDetailLabel: {
    fontSize: 12,
    color: COLORS.grey,
    fontFamily: 'DMSans',
    fontStyle: 'italic',
  },
});
