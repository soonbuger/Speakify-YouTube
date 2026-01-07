// commitlint 설정
// https://www.conventionalcommits.org/
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 타입은 소문자만 허용
    'type-case': [2, 'always', 'lower-case'],
    // 허용되는 타입 목록
    'type-enum': [
      2,
      'always',
      [
        'feat', // 새 기능
        'fix', // 버그 수정
        'docs', // 문서 수정
        'style', // 코드 포맷팅 (기능 변경 X)
        'refactor', // 리팩토링
        'test', // 테스트 추가/수정
        'chore', // 빌드, 설정 등 기타
        'perf', // 성능 개선
        'ci', // CI 설정
        'revert', // 커밋 되돌리기
      ],
    ],
  },
};
