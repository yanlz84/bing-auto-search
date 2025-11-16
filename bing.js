// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.418
// @description  自动搜索脚本
// @author       怀沙2049
// @match        https://*.bing.com/*
// @exclude      https://rewards.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @downloadURL  https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @updateURL    https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var max_rewards = 40; //重复执行的次数
//每执行4次搜索后插入暂停时间,解决账号被监控不增加积分的问题
var pause_time = 5000; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["习近平：因地制宜发展新质生产力", "高市之祸：撕裂中日关系的天崩开局", "日本民众围堵首相官邸要求高市下台", "全运绿能 “黑科技”都有啥", "黄海中部将连续三天进行实弹射击", "特朗普：已对委内瑞拉问题作出决定", "嫦娥六号土特产现“铁锈” 意味什么", "全运会今日看点：樊振东林诗栋争冠", "高市早苗在涉核问题上有新动作", "高市“搞事” 中国就让她懂事", "金鸡奖完整获奖名单公布", "男子为卖货造谣化工厂害死人被罚", "郑丽文表态：两岸同属一个中国", "日本多方批评高市早苗言行：极其愚蠢", "神舟二十二号飞船将满载货物上太空", "安世半导体事件令荷兰国际形象受损", "楼市出现新变化", "高市早苗又要“搞什么事”", "洪秀柱马英九接连痛批高市早苗", "樊振东王楚钦打扁比赛用球", "多名网友晒赴日机票退票成功记录", "恢复“大佐” 日本意欲何为", "樊振东：王楚钦是国乒绝对的领军人物", "宋佳获金鸡奖最佳女主角奖", "易烊千玺凭何成最年轻金鸡奖最佳男主", "日本三大“毒土”长出来的高市早苗", "陈思诚戴墨获金鸡奖最佳导演奖", "3位日本前首相警示高市早苗", "这些“藏盐大户”你可能每天都在吃", "局地骤降超14℃！下半年首场寒潮来袭", "易烊千玺获金鸡奖最佳男主角奖", "网红小英丈夫酒后撞人逃逸被刑拘", "沈伯洋和民进党当局为何都慌了", "王曼昱连续两届全运会晋级决赛", "钟楚曦哭着感谢宋佳", "正直播NBA：猛龙vs步行者", "一组关键词看高市早苗搞了什么事", "为什么十五运会不见奖牌榜", "王曼昱4-0胜陈梦 晋级女单决赛", "《好东西》获金鸡奖最佳故事片奖", "普京与内塔尼亚胡通话 讨论中东局势", "马龙王楚钦率北京男团晋级决赛", "广东女篮夺冠后把教练扔了起来", "黎将就以越界“建墙”向联合国申诉", "伊朗称美军事活动正在威胁国际和平", "好莱坞将拍LABUBU电影", "未来四川舰入列如何与福建舰打配合", "多名议员要求高市撤回涉台错误言论", "先帮救火再帮卖葱 温暖后续来了", "孙颖莎4-1胜朱雨玲 将与王曼昱争冠", "乌称1200名乌被俘人员将获释"]

// 直接使用默认搜索词
search_words = default_search_words;
exec();

// 定义菜单命令：开始
let menu1 = GM_registerMenuCommand('开始', function () {
    GM_setValue('Cnt', 0); // 将计数器重置为0
    location.href = "https://www.bing.com/?br_msg=Please-Wait"; // 跳转到Bing首页
}, 'o');

// 定义菜单命令：停止
let menu2 = GM_registerMenuCommand('停止', function () {
    GM_setValue('Cnt', max_rewards + 10); // 将计数器设置为超过最大搜索次数，以停止搜索
}, 'o');

// 自动将字符串中的字符进行替换
function AutoStrTrans(st) {
    let yStr = st; // 原字符串
    let rStr = ""; // 插入的混淆字符，可以自定义自己的混淆字符串
    let zStr = ""; // 结果字符串
    let prePo = 0;
    for (let i = 0; i < yStr.length;) {
        let step = parseInt(Math.random() * 5) + 1; // 随机生成步长
        if (i > 0) {
            zStr = zStr + yStr.substr(prePo, i - prePo) + rStr; // 将插入字符插入到相应位置
            prePo = i;
        }
        i = i + step;
    }
    if (prePo < yStr.length) {
        zStr = zStr + yStr.substr(prePo, yStr.length - prePo); // 将剩余部分添加到结果字符串中
    }
    return zStr;
}

// 生成指定长度的包含大写字母、小写字母和数字的随机字符串
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        // 从字符集中随机选择字符，并拼接到结果字符串中
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function exec() {
    // 生成随机延迟时间
    let randomDelay = Math.floor(Math.random() * 20000) + 5000; // 生成5秒到25秒之间的随机数
    let randomString = generateRandomString(4); //生成4个长度的随机字符串
    let randomCvid = generateRandomString(32); //生成32位长度的cvid
    'use strict';

    // 检查计数器的值，若为空则设置为超过最大搜索次数
    if (GM_getValue('Cnt') == null) {
        GM_setValue('Cnt', max_rewards + 10);
    }

    // 获取当前搜索次数
    let currentSearchCount = GM_getValue('Cnt');
    // 根据计数器的值选择搜索引擎
    if (currentSearchCount <= max_rewards / 2) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1
        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}
