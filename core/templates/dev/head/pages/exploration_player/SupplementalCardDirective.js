// Copyright 2016 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Controller for the supplemental card.
 */

oppia.directive('supplementalCard', [
  'UrlInterpolationService', function(UrlInterpolationService) {
    return {
      restrict: 'E',
      scope: {
        onClickContinueButton: '&',
        onSubmitAnswer: '&'
      },
      templateUrl: UrlInterpolationService.getDirectiveTemplateUrl(
        '/pages/exploration_player/' +
        'supplemental_card_directive.html'),
      controller: [
        '$scope', '$timeout', '$window', 'HintManagerService',
        'HintAndSolutionModalService', 'ExplorationPlayerService',
        'PlayerPositionService', 'PlayerTranscriptService',
        'WindowDimensionsService', 'CONTENT_FOCUS_LABEL_PREFIX',
        'TWO_CARD_THRESHOLD_PX', 'EVENT_ACTIVE_CARD_CHANGED',
        'CONTINUE_BUTTON_FOCUS_LABEL', 'HINT_REQUEST_STRING_I18N_IDS',
        'DELAY_FOR_HINT_FEEDBACK_MSEC', 'SolutionManagerService',
        function(
            $scope, $timeout, $window, HintManagerService,
            HintAndSolutionModalService, ExplorationPlayerService,
            PlayerPositionService, PlayerTranscriptService,
            WindowDimensionsService, CONTENT_FOCUS_LABEL_PREFIX,
            TWO_CARD_THRESHOLD_PX, EVENT_ACTIVE_CARD_CHANGED,
            CONTINUE_BUTTON_FOCUS_LABEL, HINT_REQUEST_STRING_I18N_IDS,
            DELAY_FOR_HINT_FEEDBACK_MSEC, SolutionManagerService) {
          var updateActiveCard = function() {
            var index = PlayerPositionService.getActiveCardIndex();
            if (index === null) {
              return;
            }
            $scope.activeCard = PlayerTranscriptService.getCard(index);
            $scope.clearHelpCard();
            HintManagerService.reset(ExplorationPlayerService.getInteraction(
              $scope.activeCard.stateName).hints);

            $scope.hintsExist = Boolean(ExplorationPlayerService.getInteraction(
              $scope.activeCard.stateName).hints.length);

            var solution = ExplorationPlayerService.getSolution(
              $scope.activeCard.stateName);

            SolutionManagerService.reset(solution);
            $scope.solutionExists = Boolean(solution);
          };

          $scope.OPPIA_AVATAR_IMAGE_URL = (
            UrlInterpolationService.getStaticImageUrl(
              '/avatar/oppia_avatar_100px.svg'));

          $scope.CONTINUE_BUTTON_FOCUS_LABEL = CONTINUE_BUTTON_FOCUS_LABEL;

          $scope.helpCardHtml = null;
          $scope.helpCardHasContinueButton = false;

          $scope.clearHelpCard = function() {
            $scope.helpCardHtml = null;
            $scope.helpCardHasContinueButton = false;
          };

          $scope.consumeHint = function() {
            if (!HintManagerService.areAllHintsExhausted()) {
              HintAndSolutionModalService.displayHintModal();
            }
          };

          $scope.viewSolution = function() {
            HintAndSolutionModalService.displaySolutionModal();
          };

          $scope.isHintAvailable = function() {
            var hintIsAvailable = (
              HintManagerService.isCurrentHintAvailable() &&
              !HintManagerService.areAllHintsExhausted());
            return hintIsAvailable;
          };

          $scope.areAllHintsExhausted = function() {
            return HintManagerService.areAllHintsExhausted();
          };

          $scope.isCurrentSolutionAvailable = function () {
            return SolutionManagerService.isCurrentSolutionAvailable();
          };

          $scope.isViewportNarrow = function() {
            return WindowDimensionsService.getWidth() < TWO_CARD_THRESHOLD_PX;
          };

          $scope.isWindowTall = function() {
            var supplemental = $('.conversation-skin-supplemental-card');
            var scrollBottom = $(window).scrollTop() + $(window).height();
            var supplementalBottom = supplemental.offset().top +
                                     supplemental.height();
            return scrollBottom - supplementalBottom > 50;
          };

          $scope.submitAnswer = function(answer, interactionRulesService) {
            // Do not clear the help card or submit an answer if there is an
            // upcoming card.
            if ($scope.activeCard.destStateName) {
              return;
            }

            $scope.clearHelpCard();
            $scope.onSubmitAnswer({
              answer: answer,
              rulesService: interactionRulesService
            });
          };

          $scope.$on(EVENT_ACTIVE_CARD_CHANGED, function() {
            updateActiveCard();
          });

          $scope.$on('helpCardAvailable', function(event, helpCard) {
            $scope.helpCardHtml = helpCard.helpCardHtml;
            $scope.helpCardHasContinueButton = helpCard.hasContinueButton;
          });

          updateActiveCard();
        }]
    };
  }]);
