// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.119
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
var default_search_words = ["弘扬“中国－中亚精神”", "习近平与普京就中东局势交换意见", "中考赶上暴雨 湖南一学生游泳赶考", "公安机关发布20个防诈关键词", "周杰伦患强直性脊柱炎 近照弯腰驼背", "哈梅内伊任命伊朗革命卫队陆军司令", "网警查处冒充“扁担女孩”牟利者", "男子因眼睛小被频繁误判疲劳驾驶", "顶级剧《长安的荔枝》扑了", "景区回应“女士穿比基尼可免门票”", "男子669分北大退学 次年716分上清华", "两干部买泡面被通报批评？政府回应", "以色列首都CBD被炸 多导弹半空攻防", "中国成功研发蚊子大小仿生机器人", "救援人员讲述广东怀集洪灾", "朱雀玄武敕令成功更名为周景明", "普京孙女的中文是一位北京保姆教的", "差点没认出这是张柏芝", "普京提议调解伊以冲突 特朗普拒绝", "宜宾19岁女大学生已失联近5天", "AI时代热门专业的冷思考", "伊朗向以发动48小时内最大规模袭击", "媒体人谈救护车800公里收2.8万", "REDMI K80上手评测", "以军称伊朗向以色列发射超20枚导弹", "陈冠希经纪人回应飞机争执", "伊朗否认袭击以色列医院", "以军称打击伊朗多处核设施", "起猛了看到唐国强跳女团舞", "男子辱骂交警被打断9根肋骨获赔14万", "俄罗斯告诫美国不要攻击伊朗", "已有1600余名中国公民从伊朗撤离", "美国会介入以伊冲突吗 专家解析", "#经济放缓年轻人还该去大城市吗#", "网友偶遇任重孙骁骁带女儿逛街", "老人骑三轮车撞破电梯门掉进电梯井", "印空难幸存者出席兄弟葬礼 悲痛抬棺", "毕业不是终点 是看世界的起点", "伊朗使用“泥石”导弹打击以色列", "李晟劝学粉丝：少来机场两趟能多两分", "中方回应“美或对伊朗发动袭击”", "LABUBU黄牛回收价“跌麻了”", "“苏超”赞助商数量飙升至19家", "男孩冲进金店喊打劫 老板淡定发问", "伊朗媒体发布特拉维夫遭袭瞬间", "美媒称美国或本周末袭击伊朗", "以证券交易所大楼遭伊朗导弹重创", "广东5000多人驰援怀集抗洪", "医院插错管致患者死亡 卫健委回应", "伊朗大面积断网仍在持续", "伊朗政府发言人：特朗普不懂伊朗"]

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
